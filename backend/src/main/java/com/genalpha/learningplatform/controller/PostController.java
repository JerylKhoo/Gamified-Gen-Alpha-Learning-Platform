package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ApiResponse;
import com.genalpha.learningplatform.dto.CommentResponse;
import com.genalpha.learningplatform.dto.PostResponse;
import com.genalpha.learningplatform.model.Comment;
import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.service.CommentService;
import com.genalpha.learningplatform.service.PostService;
import com.genalpha.learningplatform.util.AuthUtils;
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
    private final CommentService commentService;

    public PostController(PostService postService, CommentService commentService) {
        this.postService = postService;
        this.commentService = commentService;
    }

    @Operation(summary = "Get all posts")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(postService.getAllWithAuthor()));
    }

    @Operation(summary = "Get post by ID (includes author info)")
    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> getById(@PathVariable UUID postId) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getByIdWithAuthor(postId)));
    }

    @Operation(summary = "Get posts by user")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Post>>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getByUser(userId)));
    }

    @Operation(summary = "Create a post")
    @PostMapping
    public ResponseEntity<ApiResponse<Post>> create(@RequestBody Post post, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(postService.create(post, requesterId)));
    }

    @Operation(summary = "Toggle upvote on a post (upvote if not yet, remove if already upvoted)")
    @PostMapping("/{postId}/upvote")
    public ResponseEntity<ApiResponse<Post>> upvote(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(postService.upvote(postId, requesterId)));
    }

    @Operation(summary = "Get list of post IDs the current user has upvoted")
    @GetMapping("/upvotes/me")
    public ResponseEntity<ApiResponse<List<UUID>>> getMyUpvotes(Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(postService.getUpvotedPostIds(requesterId)));
    }

    @Operation(summary = "Report a post with reason and description (one per user, 409 if already reported)")
    @PostMapping("/{postId}/report")
    public ResponseEntity<ApiResponse<Post>> report(@PathVariable UUID postId,
                                                    @RequestBody com.genalpha.learningplatform.dto.ReportRequest request,
                                                    Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(postService.report(postId, requesterId, request.getReason(), request.getDescription())));
    }

    @Operation(summary = "Get list of post IDs the current user has reported")
    @GetMapping("/reports/me")
    public ResponseEntity<ApiResponse<List<UUID>>> getMyReports(Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(postService.getReportedPostIds(requesterId)));
    }

    @Operation(summary = "Get comments for a post")
    @GetMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable UUID postId) {
        return ResponseEntity.ok(ApiResponse.ok(commentService.getComments(postId)));
    }

    @Operation(summary = "Add a comment to a post")
    @PostMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<Comment>> addComment(@PathVariable UUID postId,
                                                           @RequestBody Comment comment,
                                                           Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(commentService.addComment(postId, requesterId, comment.getBody())));
    }

    @Operation(summary = "Update own comment")
    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Comment>> updateComment(@PathVariable UUID commentId,
                                                              @RequestBody Comment comment,
                                                              Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(commentService.updateComment(commentId, comment.getBody(), requesterId)));
    }

    @Operation(summary = "Delete own comment")
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId, Authentication authentication) {
        UUID requesterId = UUID.fromString(authentication.getName());
        commentService.deleteComment(commentId, requesterId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update own post")
    @PutMapping("/{postId}")
    public ResponseEntity<ApiResponse<Post>> update(@PathVariable UUID postId,
                                                    @RequestBody Post updates,
                                                    Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(postService.update(postId, updates, requesterId)));
    }

    @Operation(summary = "Delete own post")
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(@PathVariable UUID postId, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        postService.delete(postId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
