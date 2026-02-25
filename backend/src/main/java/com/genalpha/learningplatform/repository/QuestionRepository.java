package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findByLessonId(String lessonId);
    List<Question> findByLessonIdIn(List<String> lessonIds);
}
