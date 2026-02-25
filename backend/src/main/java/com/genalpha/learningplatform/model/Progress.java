package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "progress")
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "progress_id")
    private UUID progressId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "lesson_id", nullable = false)
    private String lessonId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "adaptive_score", columnDefinition = "jsonb")
    private String adaptiveScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "correct_questions", columnDefinition = "jsonb")
    private String correctQuestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "wrong_questions", columnDefinition = "jsonb")
    private String wrongQuestions;

    public UUID getProgressId() { return progressId; }
    public void setProgressId(UUID progressId) { this.progressId = progressId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public String getAdaptiveScore() { return adaptiveScore; }
    public void setAdaptiveScore(String adaptiveScore) { this.adaptiveScore = adaptiveScore; }
    public String getCorrectQuestions() { return correctQuestions; }
    public void setCorrectQuestions(String correctQuestions) { this.correctQuestions = correctQuestions; }
    public String getWrongQuestions() { return wrongQuestions; }
    public void setWrongQuestions(String wrongQuestions) { this.wrongQuestions = wrongQuestions; }
}
