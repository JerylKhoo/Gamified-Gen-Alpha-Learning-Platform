package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a module within a course, containing learning content stored as TEXT.
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

    @Column(columnDefinition = "text")
    private String content;

    @Column(name = "\"Order\"")
    private Integer order;
}
