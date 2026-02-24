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

    @Column(nullable = false)
    private String name;

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
