package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Users", description = "User profile endpoints")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/{userId}")
    public ResponseEntity<User> getById(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getById(userId));
    }

    @Operation(summary = "Update own profile (name, profilePic, points)")
    @PutMapping("/{userId}")
    public ResponseEntity<User> update(@PathVariable UUID userId,
                                       @RequestBody User updates,
                                       Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(userService.update(userId, updates, requesterId));
    }
}
