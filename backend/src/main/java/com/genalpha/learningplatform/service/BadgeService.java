package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Badge;
import com.genalpha.learningplatform.repository.BadgeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;

    public BadgeService(BadgeRepository badgeRepository) {
        this.badgeRepository = badgeRepository;
    }

    public List<Badge> getAll() {
        return badgeRepository.findAll();
    }

    public Badge getById(UUID badgeId) {
        return badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Badge not found"));
    }

    public Badge create(Badge badge) {
        badge.setBadgeId(null);
        return badgeRepository.save(badge);
    }

    public Badge update(UUID badgeId, Badge updates) {
        Badge badge = getById(badgeId);
        if (updates.getName() != null)        badge.setName(updates.getName());
        if (updates.getDescription() != null) badge.setDescription(updates.getDescription());
        if (updates.getIcon() != null)        badge.setIcon(updates.getIcon());
        return badgeRepository.save(badge);
    }

    public void delete(UUID badgeId) {
        Badge badge = getById(badgeId);
        badgeRepository.delete(badge);
    }
}
