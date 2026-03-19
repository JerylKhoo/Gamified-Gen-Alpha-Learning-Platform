package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Badge;
import java.util.List;
import java.util.UUID;

/**
 * Defines badge management operations for the learning platform.
 */
public interface BadgeService {
    List<Badge> getAll();
    Badge getById(String badgeId);
    Badge create(Badge badge, UUID requesterId);
    Badge update(String badgeId, Badge updates, UUID requesterId);
    void delete(String badgeId, UUID requesterId);
}
