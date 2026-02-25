package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.UserStreak;
import com.genalpha.learningplatform.service.UserStreakService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "User Streaks", description = "Track and update daily learning streaks for the logged-in user")
@RestController
@RequestMapping("/api/v1/streaks")
public class UserStreakController {

    private final UserStreakService userStreakService;

    public UserStreakController(UserStreakService userStreakService) {
        this.userStreakService = userStreakService;
    }

    @Operation(summary = "Get the logged-in user's streak (creates one if it doesn't exist)")
    @GetMapping("/me")
    public ResponseEntity<UserStreak> getMyStreak(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(userStreakService.getMyStreak(userId));
    }

    @Operation(summary = "Record activity for today (increments or resets streak per rules)")
    @PostMapping("/me/activity")
    public ResponseEntity<UserStreak> recordActivity(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(userStreakService.recordActivity(userId));
    }

    @Operation(summary = "Delete the logged-in user's streak record")
    @DeleteMapping("/{streakId}")
    public ResponseEntity<Void> delete(@PathVariable UUID streakId, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        userStreakService.delete(streakId, userId);
        return ResponseEntity.noContent().build();
    }
}
