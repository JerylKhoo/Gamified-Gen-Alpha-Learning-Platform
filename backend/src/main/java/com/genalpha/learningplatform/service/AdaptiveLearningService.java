package com.genalpha.learningplatform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.genalpha.learningplatform.dto.AdaptiveRequest;
import com.genalpha.learningplatform.dto.AdaptiveResponse;
import com.genalpha.learningplatform.dto.IRTState;
import com.genalpha.learningplatform.dto.IRTState.SRItem;
import com.genalpha.learningplatform.model.Progress;
import com.genalpha.learningplatform.model.Question;
import com.genalpha.learningplatform.repository.ProgressRepository;
import com.genalpha.learningplatform.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * ═══════════════════════════════════════════════════════════════
 *  Adaptive Learning  —  IRT (1PL Rasch) + SM-2 Spaced Repetition
 * ═══════════════════════════════════════════════════════════════
 *
 *  STATE  (stored in PROGRESS.adaptive_score as JSON)
 *  ────────────────────────────────────────────────────────────
 *  {
 *    "theta": 0.42,            ← IRT ability  [-3, 3]
 *    "items": {
 *      "<questionId>": {
 *        "interval": 4,        ← SM-2 review interval (days)
 *        "ef":       2.5,      ← SM-2 ease factor     (≥ 1.3)
 *        "reps":     2,        ← consecutive correct answers
 *        "due":      1718000000000  ← epoch-millis of next review
 *      }
 *    }
 *  }
 *
 *  IRT UPDATE  (1PL Rasch model, K = 0.3)
 *  ────────────────────────────────────────────────────────────
 *  b   = question difficulty mapped to [-3, 3]
 *  P   = 1 / (1 + exp(−1.7 × (θ − b)))      ← P(correct | θ, b)
 *
 *  correct → θ_new = θ + K × (1 − P)        ← ability rises
 *  wrong   → θ_new = θ − K × P              ← ability falls
 *
 *  SM-2 UPDATE
 *  ────────────────────────────────────────────────────────────
 *  grade = 5 if correct, 0 if wrong
 *  if grade ≥ 3:
 *      interval = 1  (reps==0) | 6  (reps==1) | round(prev × ef) (reps>1)
 *      ef       = max(1.3,  ef + 0.1 − (5−grade)(0.08 + (5−grade)×0.02))
 *      reps    += 1
 *  else:
 *      interval = 1,  reps = 0
 *  due = now + interval × 1 day
 *
 *  NEXT-QUESTION SELECTION
 *  ────────────────────────────────────────────────────────────
 *  For every candidate question compute:
 *    P_match = 1 / (1 + exp(−1.7 × (θ − b)))
 *    optimalGap = |P_match − 0.7|        ← 70% success = desirable difficulty
 *    overduePriority = 10 if due ≤ now, else 0
 *    priority = overduePriority + (1 − optimalGap)
 *
 *  Return the question with the HIGHEST priority score whose
 *  question.score > current abilityScore (0-100).
 *  Falls back to other lessons in the same category if none found.
 *  Returns null when the entire lesson / category is mastered.
 */
@Service
public class AdaptiveLearningService {

    private static final double K         = 0.3;  // IRT learning rate
    private static final double OPTIMAL_P = 0.7;  // target success probability

    private final QuestionRepository questionRepository;
    private final ProgressRepository progressRepository;
    private final ObjectMapper       objectMapper;

    public AdaptiveLearningService(QuestionRepository questionRepository,
                                   ProgressRepository progressRepository,
                                   ObjectMapper objectMapper) {
        this.questionRepository = questionRepository;
        this.progressRepository = progressRepository;
        this.objectMapper       = objectMapper;
    }

    @Transactional
    public AdaptiveResponse getNextQuestion(UUID userId, AdaptiveRequest request) {
        String  lessonId         = request.getLessonId();
        String  previousLessonId = request.getPreviousLessonId();
        UUID    questionId       = request.getQuestionId();
        boolean correct          = request.isCorrect();

        // The lesson that owns the answered question (falls back to current lesson)
        String  answerLessonId = (previousLessonId != null && !previousLessonId.isBlank())
                ? previousLessonId : lessonId;

        // ── 1. Update IRT state & correct/wrong lists for the answered question ─
        IRTState state = new IRTState(); // will be overwritten below when questionId != null
        if (questionId != null) {
            Progress answerProgress = progressRepository
                    .findByUserIdAndLessonId(userId, answerLessonId)
                    .orElseGet(() -> createProgress(userId, answerLessonId));

            state = parseIRTState(answerProgress.getAdaptiveScore());

            Question answered = questionRepository.findById(questionId).orElse(null);
            if (answered != null) {
                double b = toIRT(answered.getScore());
                state.setTheta(updateTheta(state.getTheta(), b, correct));
                updateSR(state, questionId.toString(), correct);
            }

            // Update correct_questions / wrong_questions arrays
            String qIdStr = questionId.toString();
            List<String> correctList = parseStringList(answerProgress.getCorrectQuestions());
            List<String> wrongList   = parseStringList(answerProgress.getWrongQuestions());

            if (correct) {
                if (!correctList.contains(qIdStr)) correctList.add(qIdStr);
                wrongList.remove(qIdStr);
            } else {
                if (!wrongList.contains(qIdStr)) wrongList.add(qIdStr);
                correctList.remove(qIdStr);
            }

            answerProgress.setAdaptiveScore(toJson(state));
            answerProgress.setCorrectQuestions(toJson(correctList));
            answerProgress.setWrongQuestions(toJson(wrongList));
            progressRepository.save(answerProgress);
        }

        // ── 2. Load (or create) progress for the current lesson ───────────────
        //    (needed to determine abilityScore for next-question selection)
        Progress currentProgress;
        IRTState currentState;
        if (answerLessonId.equals(lessonId)) {
            // Same lesson — state is already up-to-date from step 1
            currentState = state;
        } else {
            currentProgress = progressRepository
                    .findByUserIdAndLessonId(userId, lessonId)
                    .orElseGet(() -> createProgress(userId, lessonId));
            currentState = parseIRTState(currentProgress.getAdaptiveScore());
        }

        // ── 3. Select next question ───────────────────────────────────────────
        double abilityScore = thetaToScore(currentState.getTheta());

        Question next = selectNext(
                questionRepository.findByLessonId(lessonId),
                currentState,
                abilityScore
        );

        // ── 4. Lesson mastered — pin progress to 100 ─────────────────────────
        if (next == null) {
            currentState.setTheta(3.0); // max theta → abilityScore = 100
            Progress masteredProgress = progressRepository
                    .findByUserIdAndLessonId(userId, lessonId)
                    .orElseGet(() -> createProgress(userId, lessonId));
            masteredProgress.setAdaptiveScore(toJson(currentState));
            progressRepository.save(masteredProgress);
            abilityScore = 100.0;
        }

        return new AdaptiveResponse(abilityScore, next);
    }

    // ═══════════════════════════════════════════════════════════════
    //  IRT helpers
    // ═══════════════════════════════════════════════════════════════

    /** Map question score [0,100] → IRT difficulty [-3,3] */
    private double toIRT(int score) {
        return score / 100.0 * 6.0 - 3.0;
    }

    /** Map IRT theta [-3,3] → display ability [0,100] */
    private double thetaToScore(double theta) {
        return (theta + 3.0) / 6.0 * 100.0;
    }

    /** 1PL Rasch probability: P(correct | θ, b) */
    private double irtP(double theta, double b) {
        return 1.0 / (1.0 + Math.exp(-1.7 * (theta - b)));
    }

    /** Update theta after an answer */
    private double updateTheta(double theta, double b, boolean correct) {
        double p = irtP(theta, b);
        double updated = correct
                ? theta + K * (1.0 - p)   // ability rises on correct
                : theta - K * p;           // ability falls on wrong
        return Math.max(-3.0, Math.min(3.0, updated));
    }

    // ═══════════════════════════════════════════════════════════════
    //  SM-2 helpers
    // ═══════════════════════════════════════════════════════════════

    private void updateSR(IRTState state, String qId, boolean correct) {
        SRItem item = state.getItems().getOrDefault(qId, new SRItem());
        int grade = correct ? 5 : 0;

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

        // due = questions answered so far + interval
        // e.g. interval=6 means "show again after 6 more questions"
        state.setQuestionCount(state.getQuestionCount() + 1);
        item.setDue(state.getQuestionCount() + item.getInterval());
        state.getItems().put(qId, item);
    }

    // ═══════════════════════════════════════════════════════════════
    //  Next-question selection
    // ═══════════════════════════════════════════════════════════════

    /**
     * Scores each candidate and returns the highest-priority question
     * with difficulty strictly above the user's current abilityScore.
     */
    private Question selectNext(List<Question> candidates,
                                IRTState state,
                                double abilityScore) {
        return candidates.stream()
                .filter(q -> q.getScore() > abilityScore)
                .max(Comparator.comparingDouble(q -> priority(q, state)))
                .orElse(null);
    }

    private double priority(Question q, IRTState state) {
        double b   = toIRT(q.getScore());
        double p   = irtP(state.getTheta(), b);
        double gap = Math.abs(p - OPTIMAL_P);   // closer to 0.7 = better match

        SRItem item     = state.getItems().get(q.getQuestionId().toString());
        // overdue when never seen (item==null) or questionCount has reached the due threshold
        boolean overdue = (item == null) || (state.getQuestionCount() >= item.getDue());

        return (overdue ? 10.0 : 0.0) + (1.0 - gap);
    }

    // ═══════════════════════════════════════════════════════════════
    //  JSON / DB helpers
    // ═══════════════════════════════════════════════════════════════

    /** Parse a JSON string array (e.g. correct_questions / wrong_questions) into a mutable list. */
    @SuppressWarnings("unchecked")
    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, ArrayList.class);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private IRTState parseIRTState(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return new IRTState();
        try {
            return objectMapper.readValue(json, IRTState.class);
        } catch (Exception e) {
            return new IRTState(); // old format or corrupt → start fresh
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Progress createProgress(UUID userId, String lessonId) {
        Progress p = new Progress();
        p.setUserId(userId);
        p.setLessonId(lessonId);
        p.setAdaptiveScore("{}");
        p.setCorrectQuestions("[]");
        p.setWrongQuestions("[]");
        return p;
    }
}
