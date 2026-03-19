package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

/**
 * Represents a quiz question belonging to a course, used in adaptive learning.
 */
@Getter
@Setter
@Entity
@Table(name = "quiz")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "quiz_id")
    private UUID quizId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    private String question;
    private String type;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String options;

    private String answer;
    private String explanation;
    private Integer score;

    @Column(name = "quiz_material")
    private String quizMaterial;
}
