package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Posts", description = "Post CRUD endpoints")
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @Operation(summary = "Get all posts")
    @GetMapping
    public ResponseEntity<List<Post>> getAll() {
        return ResponseEntity.ok(postService.getAll());
    }

    @Operation(summary = "Get post by ID")
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getById(@PathVariable UUID postId) {
        return ResponseEntity.ok(postService.getById(postId));
    }

    @Operation(summary = "Get posts by user")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(postService.getByUser(userId));
    }

    @Operation(summary = "Create a post")
    @PostMapping
    public ResponseEntity<Post> create(@RequestBody Post post, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(post, requesterId));
    }

    @Operation(summary = "Update own post")
    @PutMapping("/{postId}")
    public ResponseEntity<Post> update(@PathVariable UUID postId,
                                       @RequestBody Post updates,
                                       Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(postService.update(postId, updates, requesterId));
    }

    @Operation(summary = "Delete own post")
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        postService.delete(postId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
