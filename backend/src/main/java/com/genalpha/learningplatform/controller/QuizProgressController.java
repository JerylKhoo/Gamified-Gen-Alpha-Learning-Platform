package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ApiResponse;
import com.genalpha.learningplatform.model.QuizProgress;
import com.genalpha.learningplatform.service.QuizProgressService;
import com.genalpha.learningplatform.util.AuthUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Quiz Progress", description = "Track quiz progress per user per course")
@RestController
@RequestMapping("/api/v1/quiz-progress")
public class QuizProgressController {

    private final QuizProgressService quizProgressService;

    public QuizProgressController(QuizProgressService quizProgressService) {
        this.quizProgressService = quizProgressService;
    }

    @Operation(summary = "List all quiz progress for the logged-in user")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<QuizProgress>>> getMyProgress(Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(quizProgressService.getByUserId(userId)));
    }

    @Operation(summary = "Get quiz progress for a specific course")
    @GetMapping("/me/{courseId}")
    public ResponseEntity<ApiResponse<QuizProgress>> getMyCourseProgress(@PathVariable String courseId,
                                                                          Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(quizProgressService.getByUserIdAndCourseId(userId, courseId)));
    }

    @Operation(summary = "Get quiz progress by ID")
    @GetMapping("/{quizProgressId}")
    public ResponseEntity<ApiResponse<QuizProgress>> getById(@PathVariable UUID quizProgressId,
                                                              Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(quizProgressService.getById(quizProgressId, requesterId)));
    }

    @Operation(summary = "Create quiz progress for own user")
    @PostMapping
    public ResponseEntity<ApiResponse<QuizProgress>> create(@RequestBody QuizProgress progress,
                                                             Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(quizProgressService.create(progress, requesterId)));
    }

    @Operation(summary = "Update own quiz progress")
    @PutMapping("/{quizProgressId}")
    public ResponseEntity<ApiResponse<QuizProgress>> update(@PathVariable UUID quizProgressId,
                                                             @RequestBody QuizProgress updates,
                                                             Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(quizProgressService.update(quizProgressId, updates, requesterId)));
    }

    @Operation(summary = "Delete quiz progress (admin only)")
    @DeleteMapping("/{quizProgressId}")
    public ResponseEntity<Void> delete(@PathVariable UUID quizProgressId, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        quizProgressService.delete(quizProgressId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
