package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.QuizProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizProgressRepository extends JpaRepository<QuizProgress, UUID> {
    List<QuizProgress> findByUserId(UUID userId);
    Optional<QuizProgress> findByUserIdAndCourseId(UUID userId, String courseId);
}
