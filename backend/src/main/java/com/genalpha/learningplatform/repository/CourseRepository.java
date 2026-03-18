package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, String> {
}
