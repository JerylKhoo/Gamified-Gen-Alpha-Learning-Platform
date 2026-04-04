package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ApiResponse;
import com.genalpha.learningplatform.dto.CourseWithModulesResponse;
import com.genalpha.learningplatform.service.CourseWithModulesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Courses with Modules", description = "Aggregated course and module data")
@RestController
@RequestMapping("/api/v1/courses-with-modules")
public class CourseWithModulesController {

    private final CourseWithModulesService courseWithModulesService;

    public CourseWithModulesController(CourseWithModulesService courseWithModulesService) {
        this.courseWithModulesService = courseWithModulesService;
    }

    @Operation(summary = "Get all courses with their modules")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseWithModulesResponse>>> getAllCoursesWithModules() {
        return ResponseEntity.ok(ApiResponse.ok(courseWithModulesService.getAllCoursesWithModules()));
    }

    @Operation(summary = "Get a single course with its modules")
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseWithModulesResponse>> getCourseWithModules(@PathVariable String courseId) {
        return ResponseEntity.ok(ApiResponse.ok(courseWithModulesService.getCourseWithModules(courseId)));
    }
}
