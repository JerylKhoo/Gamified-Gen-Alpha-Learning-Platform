package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User found"),
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @GetMapping("/{userId}")
    public ResponseEntity<User> getById(
            @Parameter(description = "UUID of the user to retrieve") @PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getById(userId));
    }

    @Operation(
        summary = "Update own profile",
        description = "Updates the authenticated user's **name** and/or **profilePic** only. " +
                      "Fields `points`, `role`, and `userId` are ignored even if included in the request body. " +
                      "Users may only update their own profile."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "403", description = "Cannot update another user's profile", content = @Content),
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Only `name` and `profilePic` are applied. All other fields are ignored.",
        required = true,
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = User.class),
            examples = @ExampleObject(
                name = "Update name and avatar",
                value = "{\"name\": \"CoolUser\", \"profilePic\": \"https://example.supabase.co/storage/v1/object/public/avatars/char1.png\"}"
            )
        )
    )
    @PutMapping("/{userId}")
    public ResponseEntity<User> update(
            @Parameter(description = "UUID of the user to update (must match the authenticated user)") @PathVariable UUID userId,
            @RequestBody User updates,
            Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(userService.update(userId, updates, requesterId));
    }
}
