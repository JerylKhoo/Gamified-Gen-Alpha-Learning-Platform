package com.genalpha.learningplatform.dto;

import java.util.UUID;

public class AdaptiveRequest {

    private String  lessonId;    // lesson being studied
    private UUID    questionId;  // UUID of the question just answered (null = first question in lesson)
    private boolean correct;     // whether the previous answer was correct (ignored when questionId is null)

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public UUID getQuestionId() { return questionId; }
    public void setQuestionId(UUID questionId) { this.questionId = questionId; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
}
