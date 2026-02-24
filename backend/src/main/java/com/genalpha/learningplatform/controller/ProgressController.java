package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Progress;
import com.genalpha.learningplatform.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Progress", description = "Progress CRUD endpoints (own records only)")
@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @Operation(summary = "Get all progress records for the logged-in user")
    @GetMapping("/me")
    public ResponseEntity<List<Progress>> getMyProgress(Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(progressService.getByUser(requesterId));
    }

    @Operation(summary = "Get progress by ID")
    @GetMapping("/{progressId}")
    public ResponseEntity<Progress> getById(@PathVariable UUID progressId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(progressService.getById(progressId, requesterId));
    }

    @Operation(summary = "Get progress for a specific lesson")
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<Progress> getByLesson(@PathVariable String lessonId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(progressService.getByLesson(requesterId, lessonId));
    }

    @Operation(summary = "Create progress record")
    @PostMapping
    public ResponseEntity<Progress> create(@RequestBody Progress progress, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(progressService.create(progress, requesterId));
    }

    @Operation(summary = "Update progress record")
    @PutMapping("/{progressId}")
    public ResponseEntity<Progress> update(@PathVariable UUID progressId,
                                           @RequestBody Progress updates,
                                           Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(progressService.update(progressId, updates, requesterId));
    }

    @Operation(summary = "Delete progress record")
    @DeleteMapping("/{progressId}")
    public ResponseEntity<Void> delete(@PathVariable UUID progressId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        progressService.delete(progressId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
