package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * Represents a community post created by a user on the platform.
 */
@Getter
@Setter
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "post_id")
    private UUID postId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    private String title;
    private String category;
    private String picture;
    private String description;

    @Column(name = "report_count")
    private Integer reportCount = 0;

    private Integer upvote = 0;
}
