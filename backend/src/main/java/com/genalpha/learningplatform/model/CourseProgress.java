package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import java.util.UUID;

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

    public UUID getCourseProgressId() { return courseProgressId; }
    public void setCourseProgressId(UUID courseProgressId) { this.courseProgressId = courseProgressId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
}
