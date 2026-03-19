package com.genalpha.learningplatform.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Tracks a user's daily activity streak on the platform.
 */
@Getter
@Setter
@Entity
@Table(name = "user_streaks")
public class UserStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "streak_id")
    private UUID streakId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak = 0;

    @Column(name = "streak_start")
    private LocalDate streakStart;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;
}
