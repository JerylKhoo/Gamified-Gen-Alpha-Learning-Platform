package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {
    List<UserBadge> findByUserId(UUID userId);
    boolean existsByUserIdAndBadgeId(UUID userId, UUID badgeId);
}
