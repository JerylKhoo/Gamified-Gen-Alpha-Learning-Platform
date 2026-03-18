package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quiz_progress")
public class QuizProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "quiz_progress_id")
    private UUID quizProgressId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "adaptive_score", columnDefinition = "jsonb")
    private String adaptiveScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "correct_questions", columnDefinition = "jsonb")
    private String correctQuestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "wrong_questions", columnDefinition = "jsonb")
    private String wrongQuestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "adaptive_history", columnDefinition = "jsonb")
    private String adaptiveHistory;

    @Column(name = "last_update", insertable = false, updatable = false)
    private Instant lastUpdate;

    public UUID getQuizProgressId() { return quizProgressId; }
    public void setQuizProgressId(UUID quizProgressId) { this.quizProgressId = quizProgressId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getAdaptiveScore() { return adaptiveScore; }
    public void setAdaptiveScore(String adaptiveScore) { this.adaptiveScore = adaptiveScore; }
    public String getCorrectQuestions() { return correctQuestions; }
    public void setCorrectQuestions(String correctQuestions) { this.correctQuestions = correctQuestions; }
    public String getWrongQuestions() { return wrongQuestions; }
    public void setWrongQuestions(String wrongQuestions) { this.wrongQuestions = wrongQuestions; }
    public String getAdaptiveHistory() { return adaptiveHistory; }
    public void setAdaptiveHistory(String adaptiveHistory) { this.adaptiveHistory = adaptiveHistory; }
    public Instant getLastUpdate() { return lastUpdate; }
}
