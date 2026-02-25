package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, String> {
    List<Lesson> findByCategory(String category);
}
