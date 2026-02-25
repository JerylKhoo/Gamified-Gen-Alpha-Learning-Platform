package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Badge;
import com.genalpha.learningplatform.service.BadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Badges", description = "Badge catalogue (admin-managed, publicly viewable)")
@RestController
@RequestMapping("/api/v1/badges")
public class BadgeController {

    private final BadgeService badgeService;

    public BadgeController(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @Operation(summary = "List all badges")
    @GetMapping
    public ResponseEntity<List<Badge>> getAll() {
        return ResponseEntity.ok(badgeService.getAll());
    }

    @Operation(summary = "Get badge by ID")
    @GetMapping("/{badgeId}")
    public ResponseEntity<Badge> getById(@PathVariable UUID badgeId) {
        return ResponseEntity.ok(badgeService.getById(badgeId));
    }

    @Operation(summary = "Create a badge (admin)")
    @PostMapping
    public ResponseEntity<Badge> create(@RequestBody Badge badge) {
        return ResponseEntity.status(HttpStatus.CREATED).body(badgeService.create(badge));
    }

    @Operation(summary = "Update a badge (admin)")
    @PutMapping("/{badgeId}")
    public ResponseEntity<Badge> update(@PathVariable UUID badgeId, @RequestBody Badge updates) {
        return ResponseEntity.ok(badgeService.update(badgeId, updates));
    }

    @Operation(summary = "Delete a badge (admin)")
    @DeleteMapping("/{badgeId}")
    public ResponseEntity<Void> delete(@PathVariable UUID badgeId) {
        badgeService.delete(badgeId);
        return ResponseEntity.noContent().build();
    }
}
