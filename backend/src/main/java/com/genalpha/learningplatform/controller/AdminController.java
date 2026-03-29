package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.User;
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

    public AdminController(UserService userService) {
        this.userService = userService;
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
}
