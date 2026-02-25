package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Question;
import com.genalpha.learningplatform.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Questions", description = "Question CRUD endpoints (write operations: admin only)")
@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @Operation(summary = "Get all questions")
    @GetMapping
    public ResponseEntity<List<Question>> getAll() {
        return ResponseEntity.ok(questionService.getAll());
    }

    @Operation(summary = "Get question by ID")
    @GetMapping("/{questionId}")
    public ResponseEntity<Question> getById(@PathVariable UUID questionId) {
        return ResponseEntity.ok(questionService.getById(questionId));
    }

    @Operation(summary = "Get questions by lesson")
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Question>> getByLesson(@PathVariable String lessonId) {
        return ResponseEntity.ok(questionService.getByLesson(lessonId));
    }

    @Operation(summary = "Create a question (admin only)")
    @PostMapping
    public ResponseEntity<Question> create(@RequestBody Question question, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.create(question, requesterId));
    }

    @Operation(summary = "Update a question (admin only)")
    @PutMapping("/{questionId}")
    public ResponseEntity<Question> update(@PathVariable UUID questionId,
                                           @RequestBody Question updates,
                                           Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(questionService.update(questionId, updates, requesterId));
    }

    @Operation(summary = "Delete a question (admin only)")
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> delete(@PathVariable UUID questionId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        questionService.delete(questionId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
