package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {
    List<Progress> findByUserId(UUID userId);
    Optional<Progress> findByUserIdAndLessonId(UUID userId, String lessonId);
}
