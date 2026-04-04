package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ApiResponse;
import com.genalpha.learningplatform.model.UserBadge;
import com.genalpha.learningplatform.service.UserBadgeService;
import com.genalpha.learningplatform.util.AuthUtils;
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
    public ResponseEntity<ApiResponse<List<UserBadge>>> getMyBadges(Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(userBadgeService.getMyBadges(userId)));
    }

    @Operation(summary = "Get a specific user-badge record by ID")
    @GetMapping("/{userBadgeId}")
    public ResponseEntity<ApiResponse<UserBadge>> getById(@PathVariable UUID userBadgeId, Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(userBadgeService.getById(userBadgeId, userId)));
    }

    @Operation(summary = "Award a badge to the logged-in user")
    @PostMapping("/{badgeId}")
    public ResponseEntity<ApiResponse<UserBadge>> award(@PathVariable String badgeId, Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(userBadgeService.award(badgeId, userId)));
    }

    @Operation(summary = "Remove a badge from the logged-in user")
    @DeleteMapping("/{userBadgeId}")
    public ResponseEntity<Void> delete(@PathVariable UUID userBadgeId, Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);
        userBadgeService.delete(userBadgeId, userId);
        return ResponseEntity.noContent().build();
    }
}
