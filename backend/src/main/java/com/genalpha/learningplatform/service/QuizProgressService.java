package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.QuizProgress;
import java.util.List;
import java.util.UUID;

/**
 * Defines quiz progress tracking operations for the learning platform.
 */
public interface QuizProgressService {
    List<QuizProgress> getByUserId(UUID userId);
    QuizProgress getByUserIdAndCourseId(UUID userId, String courseId);
    QuizProgress getById(UUID quizProgressId, UUID requesterId);
    QuizProgress create(QuizProgress progress, UUID requesterId);
    QuizProgress update(UUID quizProgressId, QuizProgress updates, UUID requesterId);
    void delete(UUID quizProgressId, UUID requesterId);
}
