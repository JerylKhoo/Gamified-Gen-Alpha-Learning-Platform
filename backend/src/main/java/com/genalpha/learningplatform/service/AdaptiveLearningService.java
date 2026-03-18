package com.genalpha.learningplatform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.genalpha.learningplatform.dto.AdaptiveRequest;
import com.genalpha.learningplatform.dto.AdaptiveResponse;
import com.genalpha.learningplatform.dto.IRTState;
import com.genalpha.learningplatform.dto.IRTState.SRItem;
import com.genalpha.learningplatform.model.Quiz;
import com.genalpha.learningplatform.model.QuizProgress;
import com.genalpha.learningplatform.repository.QuizProgressRepository;
import com.genalpha.learningplatform.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * ═══════════════════════════════════════════════════════════════
 *  Adaptive Learning  —  IRT (1PL Rasch) + SM-2 Spaced Repetition
 * ═══════════════════════════════════════════════════════════════
 *
 *  STATE  (stored in QUIZ_PROGRESS.adaptive_score as JSONB)
 *  ────────────────────────────────────────────────────────────
 *  {
 *    "theta": 0.42,            ← IRT ability  [-3, 3]
 *    "items": {
 *      "<quizId>": {
 *        "interval": 4,        ← SM-2 review interval (questions)
 *        "ef":       2.5,      ← SM-2 ease factor     (≥ 1.3)
 *        "reps":     2,        ← consecutive correct answers
 *        "due":      1718000000000  ← question count threshold for next review
 *      }
 *    }
 *  }
 */
@Service
public class AdaptiveLearningService {

    private static final double K         = 0.3;
    private static final double OPTIMAL_P = 0.7;

    private final QuizRepository         quizRepository;
    private final QuizProgressRepository quizProgressRepository;
    private final ObjectMapper           objectMapper;

    public AdaptiveLearningService(QuizRepository quizRepository,
                                   QuizProgressRepository quizProgressRepository,
                                   ObjectMapper objectMapper) {
        this.quizRepository         = quizRepository;
        this.quizProgressRepository = quizProgressRepository;
        this.objectMapper           = objectMapper;
    }

    @Transactional
    public AdaptiveResponse getNextQuestion(UUID userId, AdaptiveRequest request) {
        String courseId = request.getCourseId();
        UUID   quizId   = request.getQuizId();
        boolean correct = request.isCorrect();

        QuizProgress progress = quizProgressRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> createQuizProgress(userId, courseId));

        IRTState state = parseIRTState(progress.getAdaptiveScore());

        if (quizId != null) {
            Quiz answered = quizRepository.findById(quizId).orElse(null);
            if (answered != null) {
                double b = toIRT(answered.getScore());
                state.setTheta(updateTheta(state.getTheta(), b, correct));
                updateSR(state, quizId.toString(), correct);
            }

            String qIdStr = quizId.toString();
            List<String> correctList = parseStringList(progress.getCorrectQuestions());
            List<String> wrongList   = parseStringList(progress.getWrongQuestions());

            if (correct) {
                if (!correctList.contains(qIdStr)) correctList.add(qIdStr);
                wrongList.remove(qIdStr);
            } else {
                if (!wrongList.contains(qIdStr)) wrongList.add(qIdStr);
                correctList.remove(qIdStr);
            }

            List<Double> history = parseDoubleList(progress.getAdaptiveHistory());
            history.add(thetaToScore(state.getTheta()));

            progress.setAdaptiveScore(toJson(state));
            progress.setAdaptiveHistory(toJson(history));
            progress.setCorrectQuestions(toJson(correctList));
            progress.setWrongQuestions(toJson(wrongList));
            quizProgressRepository.save(progress);
        }

        double abilityScore      = thetaToScore(state.getTheta());
        List<String> answeredCorrectly = parseStringList(progress.getCorrectQuestions());

        Quiz next = selectNext(
                quizRepository.findByCourseId(courseId),
                state,
                abilityScore,
                answeredCorrectly
        );

        if (next == null) {
            state.setTheta(3.0);
            progress.setAdaptiveScore(toJson(state));
            quizProgressRepository.save(progress);
            abilityScore = 100.0;
        }

        return new AdaptiveResponse(abilityScore, next);
    }

    // ═══ IRT helpers ════════════════════════════════════════════════════════

    private double toIRT(int score) {
        return score / 100.0 * 6.0 - 3.0;
    }

    private double thetaToScore(double theta) {
        return (theta + 3.0) / 6.0 * 100.0;
    }

    private double irtP(double theta, double b) {
        return 1.0 / (1.0 + Math.exp(-1.7 * (theta - b)));
    }

    private double updateTheta(double theta, double b, boolean correct) {
        double p = irtP(theta, b);
        double updated = correct
                ? theta + K * (1.0 - p)
                : theta - K * p;
        return Math.max(-3.0, Math.min(3.0, updated));
    }

    // ═══ SM-2 helpers ═══════════════════════════════════════════════════════

    private void updateSR(IRTState state, String qId, boolean correct) {
        SRItem item  = state.getItems().getOrDefault(qId, new SRItem());
        int    grade = correct ? 5 : 0;

        if (grade >= 3) {
            if (item.getReps() == 0)      item.setInterval(1);
            else if (item.getReps() == 1) item.setInterval(6);
            else item.setInterval((int) Math.round(item.getInterval() * item.getEf()));

            double newEf = item.getEf() + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
            item.setEf(Math.max(1.3, newEf));
            item.setReps(item.getReps() + 1);
        } else {
            item.setReps(0);
            item.setInterval(1);
        }

        state.setQuestionCount(state.getQuestionCount() + 1);
        item.setDue(state.getQuestionCount() + item.getInterval());
        state.getItems().put(qId, item);
    }

    // ═══ Next-question selection ════════════════════════════════════════════

    private Quiz selectNext(List<Quiz> candidates,
                            IRTState state,
                            double abilityScore,
                            List<String> answeredCorrectly) {
        return candidates.stream()
                .filter(q -> q.getScore() != null && q.getScore() > abilityScore)
                .filter(q -> !answeredCorrectly.contains(q.getQuizId().toString()))
                .max(Comparator.comparingDouble(q -> priority(q, state)))
                .orElse(null);
    }

    private double priority(Quiz q, IRTState state) {
        double b   = toIRT(q.getScore());
        double p   = irtP(state.getTheta(), b);
        double gap = Math.abs(p - OPTIMAL_P);

        SRItem item    = state.getItems().get(q.getQuizId().toString());
        boolean overdue = (item == null) || (state.getQuestionCount() >= item.getDue());

        return (overdue ? 10.0 : 0.0) + (1.0 - gap);
    }

    // ═══ JSON / DB helpers ══════════════════════════════════════════════════

    @SuppressWarnings("unchecked")
    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return new ArrayList<>();
        try { return objectMapper.readValue(json, ArrayList.class); }
        catch (Exception e) { return new ArrayList<>(); }
    }

    @SuppressWarnings("unchecked")
    private List<Double> parseDoubleList(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return new ArrayList<>();
        try { return objectMapper.readValue(json, ArrayList.class); }
        catch (Exception e) { return new ArrayList<>(); }
    }

    private IRTState parseIRTState(String json) {
        if (json == null || json.isBlank() || json.equals("{}")) return new IRTState();
        try { return objectMapper.readValue(json, IRTState.class); }
        catch (Exception e) { return new IRTState(); }
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return "{}"; }
    }

    private QuizProgress createQuizProgress(UUID userId, String courseId) {
        QuizProgress p = new QuizProgress();
        p.setUserId(userId);
        p.setCourseId(courseId);
        p.setAdaptiveScore("{}");
        p.setAdaptiveHistory("[]");
        p.setCorrectQuestions("[]");
        p.setWrongQuestions("[]");
        return p;
    }
}
