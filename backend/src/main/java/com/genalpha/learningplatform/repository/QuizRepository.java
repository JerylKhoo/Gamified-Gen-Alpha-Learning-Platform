package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByLessonId(String lessonId);
}
