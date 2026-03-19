package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Quiz;
import java.util.List;
import java.util.UUID;

/**
 * Defines quiz question management operations for the learning platform.
 */
public interface QuizService {
    List<Quiz> getByCourseId(String courseId);
    Quiz getById(UUID quizId);
    Quiz create(Quiz quiz, UUID requesterId);
    Quiz update(UUID quizId, Quiz updates, UUID requesterId);
    void delete(UUID quizId, UUID requesterId);
}
