package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Storage", description = "Storage bucket endpoints")
@RestController
@RequestMapping("/api/v1/avatars")
public class StorageController {

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @Operation(summary = "List all avatar image URLs")
    @GetMapping
    public ResponseEntity<List<String>> listAvatars() {
        return ResponseEntity.ok(storageService.listAvatarUrls());
    }
}
