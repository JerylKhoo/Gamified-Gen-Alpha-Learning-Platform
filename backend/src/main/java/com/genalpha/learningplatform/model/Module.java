package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Represents a module within a course, containing learning content stored as JSONB.
 */
@Getter
@Setter
@Entity
@Table(name = "module")
public class Module {

    @Id
    @Column(name = "module_id")
    private String moduleId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String content;
}
