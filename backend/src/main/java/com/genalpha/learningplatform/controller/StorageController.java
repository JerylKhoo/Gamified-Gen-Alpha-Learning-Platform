package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Storage", description = "Storage bucket endpoints")
@RestController
@RequestMapping("/api/v1/profilepics")
public class StorageController {

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @Operation(summary = "List all profile picture URLs")
    @GetMapping
    public ResponseEntity<List<String>> listProfilePics() {
        return ResponseEntity.ok(storageService.listProfilePicUrls());
    }
}
