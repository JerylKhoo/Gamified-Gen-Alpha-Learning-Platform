package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.User;
import java.util.List;
import java.util.UUID;

/**
 * Defines user management operations for the learning platform.
 */
public interface UserService {
    User getById(UUID userId);
    User update(UUID userId, User updates, UUID requesterId);
    boolean isAdmin(UUID userId);
    boolean isCollaborator(UUID userId);
    boolean isContributorOrAbove(UUID userId);
    List<User> getAll();
    List<User> getLeaderboard();
    User updateRole(UUID userId, String role, UUID requesterId);
    void incrementReportCount(UUID userId);
}
