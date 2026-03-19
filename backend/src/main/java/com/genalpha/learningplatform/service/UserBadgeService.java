package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.UserBadge;
import java.util.List;
import java.util.UUID;

/**
 * Defines user badge award and retrieval operations for the learning platform.
 */
public interface UserBadgeService {
    List<UserBadge> getMyBadges(UUID userId);
    UserBadge getById(UUID userBadgeId, UUID requesterId);
    UserBadge award(String badgeId, UUID userId);
    void delete(UUID userBadgeId, UUID requesterId);
}
