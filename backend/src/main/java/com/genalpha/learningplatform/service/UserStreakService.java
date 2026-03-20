package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.UserStreak;
import java.util.UUID;

/**
 * Defines user streak tracking operations for the learning platform.
 */
public interface UserStreakService {
    UserStreak getMyStreak(UUID userId);
    UserStreak recordActivity(UUID userId);
    UserStreak getById(UUID streakId, UUID requesterId);
    void delete(UUID streakId, UUID requesterId);
}
