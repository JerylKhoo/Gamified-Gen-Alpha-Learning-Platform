package com.genalpha.learningplatform.service;

import java.util.List;
import java.util.UUID;

import com.genalpha.learningplatform.model.User;

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

    List<com.genalpha.learningplatform.dto.AgentLeaderboardDTO> getAgentLeaderboard();

    User updateRole(UUID userId, String role, UUID requesterId);

    void incrementReportCount(UUID userId);

    void decrementReportCount(UUID userId, int count);

    void deleteUser(UUID userId, UUID requesterId);

    /**
     * Promotes a user to Collaborator if their points >= 80,000.
     * Idempotent: already-Collaborator or Admin users are left unchanged.
     *
     * @return the (possibly updated) user
     */
    User promoteToCollaboratorIfEligible(UUID userId);
}
