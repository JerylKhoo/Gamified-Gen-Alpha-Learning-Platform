package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

/**
 * Tracks a user's adaptive quiz progress for a specific course, including IRT state and spaced repetition data.
 */
@Getter
@Setter
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
}
