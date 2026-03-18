package com.genalpha.learningplatform.dto;

import java.util.UUID;

public class AdaptiveRequest {

    private String courseId;  // course being studied
    private UUID   quizId;    // UUID of the quiz question just answered (null = first question in course)
    private boolean correct;  // whether the previous answer was correct (ignored when quizId is null)

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public UUID getQuizId() { return quizId; }
    public void setQuizId(UUID quizId) { this.quizId = quizId; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
}
