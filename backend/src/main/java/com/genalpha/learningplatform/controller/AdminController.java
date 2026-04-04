package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ApiResponse;
import com.genalpha.learningplatform.dto.ReportedPostResponse;
import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.service.ModerationService;
import com.genalpha.learningplatform.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Admin", description = "Admin-only management endpoints")
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserService userService;
    private final ModerationService moderationService;

    public AdminController(UserService userService, ModerationService moderationService) {
        this.userService = userService;
        this.moderationService = moderationService;
    }

    @Operation(summary = "Get all users (admin only)")
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can perform this action");
        }
        return ResponseEntity.ok(ApiResponse.ok(userService.getAll()));
    }

    @Operation(summary = "Update a user's role (admin only)")
    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<User>> updateRole(@PathVariable UUID userId,
                                                        @RequestBody Map<String, String> body,
                                                        Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        String role = body.get("role");
        return ResponseEntity.ok(ApiResponse.ok(userService.updateRole(userId, role, requesterId)));
    }

    @Operation(summary = "Delete a user account (admin only) — removes from Supabase Auth and cascades DB deletion")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        userService.deleteUser(userId, requesterId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all reported posts (admin only)")
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<ReportedPostResponse>>> getReportedPosts(Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can perform this action");
        }
        return ResponseEntity.ok(ApiResponse.ok(moderationService.getReportedPosts()));
    }

    @Operation(summary = "Approve a reported post (clear all reports)")
    @PostMapping("/reports/{postId}/approve")
    public ResponseEntity<ApiResponse<Void>> approvePost(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        moderationService.approvePost(postId, requesterId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Dismiss reports as fake (clear reports and undo author report count)")
    @PostMapping("/reports/{postId}/dismiss")
    public ResponseEntity<ApiResponse<Void>> dismissReports(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        moderationService.dismissReports(postId, requesterId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Delete a reported post")
    @DeleteMapping("/reports/{postId}")
    public ResponseEntity<Void> deleteReportedPost(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        moderationService.deleteReportedPost(postId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
