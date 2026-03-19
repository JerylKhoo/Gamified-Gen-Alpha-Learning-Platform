package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.CourseProgress;
import java.util.List;
import java.util.UUID;

/**
 * Defines course progress tracking operations for the learning platform.
 */
public interface CourseProgressService {
    List<CourseProgress> getByUserId(UUID userId);
    List<CourseProgress> getByUserIdAndCourseId(UUID userId, String courseId);
    CourseProgress create(CourseProgress progress, UUID requesterId);
    void delete(UUID courseProgressId, UUID requesterId);
}
