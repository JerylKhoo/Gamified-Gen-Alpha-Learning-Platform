package com.genalpha.learningplatform.dto;

import java.util.UUID;

public class AdaptiveRequest {

    private UUID   questionId;      // UUID of the question just answered (null = first question)
    private String previousLessonId; // lessonId the answered question belongs to (null = same as lessonId)
    private String lessonId;         // current lesson being studied (for next question search)
    private String category;
    private boolean correct;         // whether the previous answer was correct

    public UUID getQuestionId() { return questionId; }
    public void setQuestionId(UUID questionId) { this.questionId = questionId; }
    public String getPreviousLessonId() { return previousLessonId; }
    public void setPreviousLessonId(String previousLessonId) { this.previousLessonId = previousLessonId; }
    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
}
