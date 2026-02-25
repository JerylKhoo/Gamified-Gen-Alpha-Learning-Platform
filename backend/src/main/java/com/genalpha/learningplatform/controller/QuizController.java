package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Quiz;
import com.genalpha.learningplatform.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Quiz", description = "Quiz CRUD endpoints (write operations: admin only)")
@RestController
@RequestMapping("/api/v1/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @Operation(summary = "Get all quiz items")
    @GetMapping
    public ResponseEntity<List<Quiz>> getAll() {
        return ResponseEntity.ok(quizService.getAll());
    }

    @Operation(summary = "Get quiz item by ID")
    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getById(@PathVariable UUID quizId) {
        return ResponseEntity.ok(quizService.getById(quizId));
    }

    @Operation(summary = "Get quiz items by lesson")
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Quiz>> getByLesson(@PathVariable String lessonId) {
        return ResponseEntity.ok(quizService.getByLesson(lessonId));
    }

    @Operation(summary = "Create a quiz item (admin only)")
    @PostMapping
    public ResponseEntity<Quiz> create(@RequestBody Quiz quiz, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.create(quiz, requesterId));
    }

    @Operation(summary = "Update a quiz item (admin only)")
    @PutMapping("/{quizId}")
    public ResponseEntity<Quiz> update(@PathVariable UUID quizId,
                                       @RequestBody Quiz updates,
                                       Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(quizService.update(quizId, updates, requesterId));
    }

    @Operation(summary = "Delete a quiz item (admin only)")
    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> delete(@PathVariable UUID quizId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        quizService.delete(quizId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
