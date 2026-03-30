package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Module;
import com.genalpha.learningplatform.service.ModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.genalpha.learningplatform.util.AuthUtils;

import java.util.List;
import java.util.UUID;

@Tag(name = "Modules", description = "Course module management")
@RestController
@RequestMapping("/api/v1/modules")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @Operation(summary = "List modules by course")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Module>> getByCourseId(@PathVariable String courseId) {
        return ResponseEntity.ok(moduleService.getByCourseId(courseId));
    }

    @Operation(summary = "Get module by ID")
    @GetMapping("/{moduleId}")
    public ResponseEntity<Module> getById(@PathVariable String moduleId) {
        return ResponseEntity.ok(moduleService.getById(moduleId));
    }

    @Operation(summary = "Create a module (admin)")
    @PostMapping
    public ResponseEntity<Module> create(@RequestBody Module module, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.create(module, requesterId));
    }

    @Operation(summary = "Update a module (admin)")
    @PutMapping("/{moduleId}")
    public ResponseEntity<Module> update(@PathVariable String moduleId,
                                         @RequestBody Module updates,
                                         Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(moduleService.update(moduleId, updates, requesterId));
    }

    @Operation(summary = "Delete a module (admin)")
    @DeleteMapping("/{moduleId}")
    public ResponseEntity<Void> delete(@PathVariable String moduleId, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        moduleService.delete(moduleId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
