package com.genalpha.learningplatform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @Column(name = "lesson_id")
    private String lessonId;

    @Column(nullable = false)
    private String category;

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
