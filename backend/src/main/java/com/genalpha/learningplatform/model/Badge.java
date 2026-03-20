package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a badge that can be awarded to users for achievements.
 */
@Getter
@Setter
@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @Column(name = "badge_id")
    private String badgeId;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(columnDefinition = "TEXT")
    private String icon;
}
