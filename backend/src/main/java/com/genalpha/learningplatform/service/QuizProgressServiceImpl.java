package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.QuizProgress;
import com.genalpha.learningplatform.repository.QuizProgressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Concrete implementation of QuizProgressService backed by JPA.
 */
@Service
public class QuizProgressServiceImpl implements QuizProgressService {

    private final QuizProgressRepository quizProgressRepository;
    private final UserService userService;

    public QuizProgressServiceImpl(QuizProgressRepository quizProgressRepository, UserService userService) {
        this.quizProgressRepository = quizProgressRepository;
        this.userService = userService;
    }

    @Override
    public List<QuizProgress> getByUserId(UUID userId) {
        return quizProgressRepository.findByUserId(userId);
    }

    @Override
    public QuizProgress getByUserIdAndCourseId(UUID userId, String courseId) {
        return quizProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz progress not found"));
    }

    @Override
    public QuizProgress getById(UUID quizProgressId, UUID requesterId) {
        QuizProgress progress = quizProgressRepository.findById(quizProgressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz progress not found"));
        if (!progress.getUserId().equals(requesterId) && !userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return progress;
    }

    @Override
    public QuizProgress create(QuizProgress progress, UUID requesterId) {
        progress.setQuizProgressId(null);
        progress.setUserId(requesterId);
        if (progress.getAdaptiveScore() == null)    progress.setAdaptiveScore("{}");
        if (progress.getCorrectQuestions() == null) progress.setCorrectQuestions("[]");
        if (progress.getWrongQuestions() == null)   progress.setWrongQuestions("[]");
        if (progress.getAdaptiveHistory() == null)  progress.setAdaptiveHistory("[]");
        return quizProgressRepository.save(progress);
    }

    @Override
    public QuizProgress update(UUID quizProgressId, QuizProgress updates, UUID requesterId) {
        QuizProgress progress = getById(quizProgressId, requesterId);
        if (updates.getAdaptiveScore() != null)    progress.setAdaptiveScore(updates.getAdaptiveScore());
        if (updates.getCorrectQuestions() != null) progress.setCorrectQuestions(updates.getCorrectQuestions());
        if (updates.getWrongQuestions() != null)   progress.setWrongQuestions(updates.getWrongQuestions());
        if (updates.getAdaptiveHistory() != null)  progress.setAdaptiveHistory(updates.getAdaptiveHistory());
        return quizProgressRepository.save(progress);
    }

    @Override
    public void delete(UUID quizProgressId, UUID requesterId) {
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        QuizProgress progress = quizProgressRepository.findById(quizProgressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz progress not found"));
        quizProgressRepository.delete(progress);
    }
}
