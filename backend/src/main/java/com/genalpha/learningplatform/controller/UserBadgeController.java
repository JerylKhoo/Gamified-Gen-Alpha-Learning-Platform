package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.UserBadge;
import com.genalpha.learningplatform.service.UserBadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "User Badges", description = "Award and query badges earned by the logged-in user")
@RestController
@RequestMapping("/api/v1/user-badges")
public class UserBadgeController {

    private final UserBadgeService userBadgeService;

    public UserBadgeController(UserBadgeService userBadgeService) {
        this.userBadgeService = userBadgeService;
    }

    @Operation(summary = "Get all badges earned by the logged-in user")
    @GetMapping("/me")
    public ResponseEntity<List<UserBadge>> getMyBadges(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(userBadgeService.getMyBadges(userId));
    }

    @Operation(summary = "Get a specific user-badge record by ID")
    @GetMapping("/{id}")
    public ResponseEntity<UserBadge> getById(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(userBadgeService.getById(id, userId));
    }

    @Operation(summary = "Award a badge to the logged-in user")
    @PostMapping("/{badgeId}")
    public ResponseEntity<UserBadge> award(@PathVariable UUID badgeId, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(userBadgeService.award(badgeId, userId));
    }

    @Operation(summary = "Remove a badge from the logged-in user")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        userBadgeService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}
