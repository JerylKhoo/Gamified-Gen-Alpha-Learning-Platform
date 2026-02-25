package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.UserBadge;
import com.genalpha.learningplatform.repository.BadgeRepository;
import com.genalpha.learningplatform.repository.UserBadgeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class UserBadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository     badgeRepository;

    public UserBadgeService(UserBadgeRepository userBadgeRepository,
                            BadgeRepository badgeRepository) {
        this.userBadgeRepository = userBadgeRepository;
        this.badgeRepository     = badgeRepository;
    }

    public List<UserBadge> getMyBadges(UUID userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    public UserBadge getById(UUID id, UUID requesterId) {
        UserBadge ub = userBadgeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "UserBadge not found"));
        if (!ub.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ub;
    }

    /** Award a badge to the logged-in user. Idempotent — silently returns existing record if already earned. */
    public UserBadge award(UUID badgeId, UUID userId) {
        if (!badgeRepository.existsById(badgeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Badge not found");
        }
        if (userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)) {
            return userBadgeRepository.findByUserId(userId).stream()
                    .filter(ub -> ub.getBadgeId().equals(badgeId))
                    .findFirst()
                    .orElseThrow();
        }
        UserBadge ub = new UserBadge();
        ub.setUserId(userId);
        ub.setBadgeId(badgeId);
        ub.setEarnedAt(Instant.now());
        return userBadgeRepository.save(ub);
    }

    public void delete(UUID id, UUID requesterId) {
        UserBadge ub = getById(id, requesterId);
        userBadgeRepository.delete(ub);
    }
}
