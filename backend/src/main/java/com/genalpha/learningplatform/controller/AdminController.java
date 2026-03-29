package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.AdminUserResponse;
import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.PostReportRepository;
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
    private final PostReportRepository postReportRepository;

    public AdminController(UserService userService, PostReportRepository postReportRepository) {
        this.userService = userService;
        this.postReportRepository = postReportRepository;
    }

    @Operation(summary = "Get all users with report counts (admin only)")
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        if (!userService.isAdmin(requesterId)) {
            return ResponseEntity.status(403).build();
        }
        List<AdminUserResponse> result = userService.getAll().stream().map(this::toResponse).toList();
        return ResponseEntity.ok(result);
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

    private AdminUserResponse toResponse(User user) {
        AdminUserResponse r = new AdminUserResponse();
        r.setUserId(user.getUserId());
        r.setName(user.getName());
        r.setPoints(user.getPoints());
        r.setProfilePic(user.getProfilePic());
        r.setRole(user.getRole());
        r.setReportCount(postReportRepository.countReportsOnPostsByAuthor(user.getUserId()));
        return r;
    }
}
