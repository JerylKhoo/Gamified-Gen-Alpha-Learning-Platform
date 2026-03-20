package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Course;
import java.util.List;
import java.util.UUID;

/**
 * Defines course management operations for the learning platform.
 */
public interface CourseService {
    List<Course> getAll();
    Course getById(String courseId);
    Course create(Course course, UUID requesterId);
    Course update(String courseId, Course updates, UUID requesterId);
    void delete(String courseId, UUID requesterId);
}
