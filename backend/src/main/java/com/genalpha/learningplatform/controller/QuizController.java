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

@Tag(name = "Quizzes", description = "Quiz question management")
@RestController
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @Operation(summary = "List quizzes by course")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Quiz>> getByCourseId(@PathVariable String courseId) {
        return ResponseEntity.ok(quizService.getByCourseId(courseId));
    }

    @Operation(summary = "Get quiz by ID")
    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getById(@PathVariable UUID quizId) {
        return ResponseEntity.ok(quizService.getById(quizId));
    }

    @Operation(summary = "Create a quiz question (admin)")
    @PostMapping
    public ResponseEntity<Quiz> create(@RequestBody Quiz quiz, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.create(quiz, requesterId));
    }

    @Operation(summary = "Update a quiz question (admin)")
    @PutMapping("/{quizId}")
    public ResponseEntity<Quiz> update(@PathVariable UUID quizId,
                                       @RequestBody Quiz updates,
                                       Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(quizService.update(quizId, updates, requesterId));
    }

    @Operation(summary = "Delete a quiz question (admin)")
    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> delete(@PathVariable UUID quizId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        quizService.delete(quizId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
