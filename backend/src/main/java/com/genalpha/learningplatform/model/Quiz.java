package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

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

    public UUID getQuizId() { return quizId; }
    public void setQuizId(UUID quizId) { this.quizId = quizId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getQuizMaterial() { return quizMaterial; }
    public void setQuizMaterial(String quizMaterial) { this.quizMaterial = quizMaterial; }
}
