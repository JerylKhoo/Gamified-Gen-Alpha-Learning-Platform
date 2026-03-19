package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Badge;
import com.genalpha.learningplatform.repository.BadgeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Concrete implementation of BadgeService backed by JPA.
 */
@Service
public class BadgeServiceImpl implements BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserService userService;

    public BadgeServiceImpl(BadgeRepository badgeRepository, UserService userService) {
        this.badgeRepository = badgeRepository;
        this.userService = userService;
    }

    @Override
    public List<Badge> getAll() {
        return badgeRepository.findAll();
    }

    @Override
    public Badge getById(String badgeId) {
        return badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Badge not found"));
    }

    @Override
    public Badge create(Badge badge, UUID requesterId) {
        requireAdmin(requesterId);
        if (badge.getBadgeId() == null || badge.getBadgeId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Badge ID is required");
        }
        return badgeRepository.save(badge);
    }

    @Override
    public Badge update(String badgeId, Badge updates, UUID requesterId) {
        requireAdmin(requesterId);
        Badge badge = getById(badgeId);
        if (updates.getName() != null)        badge.setName(updates.getName());
        if (updates.getDescription() != null) badge.setDescription(updates.getDescription());
        if (updates.getIcon() != null)        badge.setIcon(updates.getIcon());
        return badgeRepository.save(badge);
    }

    @Override
    public void delete(String badgeId, UUID requesterId) {
        requireAdmin(requesterId);
        badgeRepository.delete(getById(badgeId));
    }

    private void requireAdmin(UUID userId) {
        if (!userService.isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
