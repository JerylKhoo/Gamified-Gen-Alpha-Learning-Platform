package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ApiResponse;
import com.genalpha.learningplatform.model.CourseProgress;
import com.genalpha.learningplatform.service.CourseProgressService;
import com.genalpha.learningplatform.util.AuthUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Course Progress", description = "Track module completion per user per course")
@RestController
@RequestMapping("/api/v1/course-progress")
public class CourseProgressController {

    private final CourseProgressService courseProgressService;

    public CourseProgressController(CourseProgressService courseProgressService) {
        this.courseProgressService = courseProgressService;
    }

    @Operation(summary = "List all course progress for the logged-in user")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<CourseProgress>>> getMyProgress(Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(courseProgressService.getByUserId(userId)));
    }

    @Operation(summary = "Get course progress for a specific course")
    @GetMapping("/me/{courseId}")
    public ResponseEntity<ApiResponse<List<CourseProgress>>> getMyCourseProgress(@PathVariable String courseId,
                                                                                  Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(courseProgressService.getByUserIdAndCourseId(userId, courseId)));
    }

    @Operation(summary = "Mark a module as completed")
    @PostMapping
    public ResponseEntity<ApiResponse<CourseProgress>> create(@RequestBody CourseProgress progress,
                                                               Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(courseProgressService.create(progress, requesterId)));
    }

    @Operation(summary = "Delete course progress (admin only)")
    @DeleteMapping("/{courseProgressId}")
    public ResponseEntity<Void> delete(@PathVariable UUID courseProgressId, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        courseProgressService.delete(courseProgressId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
