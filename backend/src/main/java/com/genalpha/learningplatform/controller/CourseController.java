package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Course;
import com.genalpha.learningplatform.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.genalpha.learningplatform.util.AuthUtils;

import java.util.List;
import java.util.UUID;

@Tag(name = "Courses", description = "Course management")
@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @Operation(summary = "List all courses")
    @GetMapping
    public ResponseEntity<List<Course>> getAll() {
        return ResponseEntity.ok(courseService.getAll());
    }

    @Operation(summary = "Get course by ID")
    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getById(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getById(courseId));
    }

    @Operation(summary = "Create a course (admin)")
    @PostMapping
    public ResponseEntity<Course> create(@RequestBody Course course, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(course, requesterId));
    }

    @Operation(summary = "Update a course (admin)")
    @PutMapping("/{courseId}")
    public ResponseEntity<Course> update(@PathVariable String courseId,
                                         @RequestBody Course updates,
                                         Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(courseService.update(courseId, updates, requesterId));
    }

    @Operation(summary = "Delete a course (admin)")
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> delete(@PathVariable String courseId, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        courseService.delete(courseId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
