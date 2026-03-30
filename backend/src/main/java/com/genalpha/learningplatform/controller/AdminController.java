package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ReportedPostResponse;
import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.service.PostService;
import com.genalpha.learningplatform.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Admin", description = "Admin-only management endpoints")
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserService userService;
    private final PostService postService;

    public AdminController(UserService userService, PostService postService) {
        this.userService = userService;
        this.postService = postService;
    }

    @Operation(summary = "Get all users (admin only)")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        if (!userService.isAdmin(requesterId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.getAll());
    }

    @Operation(summary = "Update a user's role (admin only)")
    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<User> updateRole(@PathVariable UUID userId,
                                            @RequestBody Map<String, String> body,
                                            Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        String role = body.get("role");
        return ResponseEntity.ok(userService.updateRole(userId, role, requesterId));
    }

    @Operation(summary = "Get all reported posts (admin only)")
    @GetMapping("/reports")
    public ResponseEntity<List<ReportedPostResponse>> getReportedPosts(Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        if (!userService.isAdmin(requesterId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(postService.getReportedPosts());
    }

    @Operation(summary = "Approve a reported post (clear all reports)")
    @PostMapping("/reports/{postId}/approve")
    public ResponseEntity<Void> approvePost(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        postService.approvePost(postId, requesterId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Dismiss reports as fake (clear reports and undo author report count)")
    @PostMapping("/reports/{postId}/dismiss")
    public ResponseEntity<Void> dismissReports(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        postService.dismissReports(postId, requesterId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Delete a reported post")
    @DeleteMapping("/reports/{postId}")
    public ResponseEntity<Void> deleteReportedPost(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        postService.deleteReportedPost(postId, requesterId);
        return ResponseEntity.ok().build();
    }
}
