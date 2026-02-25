package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Lesson;
import com.genalpha.learningplatform.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Lessons", description = "Lesson CRUD endpoints (write operations: admin only)")
@RestController
@RequestMapping("/api/v1/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @Operation(summary = "Get all lessons")
    @GetMapping
    public ResponseEntity<List<Lesson>> getAll() {
        return ResponseEntity.ok(lessonService.getAll());
    }

    @Operation(summary = "Get lessons by category")
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Lesson>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(lessonService.getByCategory(category));
    }

    @Operation(summary = "Get lesson by ID")
    @GetMapping("/{lessonId}")
    public ResponseEntity<Lesson> getById(@PathVariable String lessonId) {
        return ResponseEntity.ok(lessonService.getById(lessonId));
    }

    @Operation(summary = "Create a lesson (admin only)")
    @PostMapping
    public ResponseEntity<Lesson> create(@RequestBody Lesson lesson, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(lessonService.create(lesson, requesterId));
    }

    @Operation(summary = "Update a lesson (admin only)")
    @PutMapping("/{lessonId}")
    public ResponseEntity<Lesson> update(@PathVariable String lessonId,
                                         @RequestBody Lesson updates,
                                         Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(lessonService.update(lessonId, updates, requesterId));
    }

    @Operation(summary = "Delete a lesson (admin only)")
    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> delete(@PathVariable String lessonId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        lessonService.delete(lessonId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
