package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * Tracks a user's progress through individual modules within a course.
 */
@Getter
@Setter
@Entity
@Table(name = "course_progress")
public class CourseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "course_progress_id")
    private UUID courseProgressId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @Column(name = "module_id", nullable = false)
    private String moduleId;
}
