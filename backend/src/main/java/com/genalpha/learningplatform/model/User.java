package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents a registered user in the learning platform.
 * The user_id is the UUID from Supabase authentication.
 */
@Getter
@Setter
@Entity
@Table(name = "\"USER\"")
public class User {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column
    private Integer points;

    @Column(name = "profile_pic")
    private String profilePic;

    @Column
    private String email;

    @Column(nullable = false)
    private String role = "User";

    @Column(name = "report_count")
    private Integer reportCount = 0;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
