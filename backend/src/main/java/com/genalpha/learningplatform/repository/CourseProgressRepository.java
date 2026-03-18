package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseProgressRepository extends JpaRepository<CourseProgress, UUID> {
    List<CourseProgress> findByUserId(UUID userId);
    List<CourseProgress> findByUserIdAndCourseId(UUID userId, String courseId);
    boolean existsByUserIdAndCourseIdAndModuleId(UUID userId, String courseId, String moduleId);
}
