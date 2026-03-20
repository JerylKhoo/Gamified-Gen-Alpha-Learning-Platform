package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a learning course in the platform.
 */
@Getter
@Setter
@Entity
@Table(name = "course")
public class Course {

    @Id
    @Column(name = "course_id")
    private String courseId;

    private String description;
    private String image;
}
