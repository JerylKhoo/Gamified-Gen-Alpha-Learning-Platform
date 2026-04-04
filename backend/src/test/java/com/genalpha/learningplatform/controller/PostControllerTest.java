package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.PostResponse;
import com.genalpha.learningplatform.model.Comment;
import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.service.CommentService;
import com.genalpha.learningplatform.service.PostService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Black-box controller tests for PostController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(PostController.class)
@DisplayName("PostController Black-Box Tests")
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PostService postService;

    @MockitoBean
    private CommentService commentService;

    // ── GET /api/v1/posts ─────────────────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /posts → 200 with ApiResponse envelope containing post list")
    void getAll_returns200WithEnvelopedPostList() throws Exception {
        PostResponse post = new PostResponse();
        post.setTitle("Hello World");

        when(postService.getAllWithAuthor()).thenReturn(List.of(post));

        mockMvc.perform(get("/api/v1/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Hello World"));

        verify(postService, times(1)).getAllWithAuthor();
    }

    // ── GET /api/v1/posts/{postId} ────────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /posts/{postId} → 200 with ApiResponse envelope when post exists")
    void getById_returns200WithEnvelopedPost() throws Exception {
        UUID postId = UUID.randomUUID();
        PostResponse post = new PostResponse();
        post.setTitle("My Post");

        when(postService.getByIdWithAuthor(postId)).thenReturn(post);

        mockMvc.perform(get("/api/v1/posts/{postId}", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("My Post"));

        verify(postService, times(1)).getByIdWithAuthor(postId);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /posts/{postId} → 404 when post does not exist")
    void getById_returns404_whenNotFound() throws Exception {
        UUID postId = UUID.randomUUID();
        when(postService.getByIdWithAuthor(postId))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Post not found"));

        mockMvc.perform(get("/api/v1/posts/{postId}", postId))
                .andExpect(status().isNotFound());

        verify(postService, times(1)).getByIdWithAuthor(postId);
    }

    // ── POST /api/v1/posts ────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /posts → 201 with created post")
    void create_returns201WithCreatedPost() throws Exception {
        Post post = new Post();
        post.setPostId(UUID.randomUUID());
        post.setTitle("New Post");

        when(postService.create(any(Post.class), any(UUID.class))).thenReturn(post);

        mockMvc.perform(post("/api/v1/posts").with(csrf())
                        .contentType("application/json")
                        .content("{\"title\":\"New Post\",\"body\":\"Hello\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("New Post"));

        verify(postService, times(1)).create(any(Post.class), any(UUID.class));
    }

    // ── POST /api/v1/posts/{postId}/upvote ───────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /posts/{postId}/upvote → 200 with updated post")
    void upvote_returns200WithUpdatedPost() throws Exception {
        UUID postId = UUID.randomUUID();
        Post post = new Post();
        post.setPostId(postId);
        post.setUpvote(1);

        when(postService.upvote(eq(postId), any(UUID.class))).thenReturn(post);

        mockMvc.perform(post("/api/v1/posts/{postId}/upvote", postId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.upvote").value(1));

        verify(postService, times(1)).upvote(eq(postId), any(UUID.class));
    }

    // ── GET /api/v1/posts/{postId}/comments ──────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /posts/{postId}/comments → 200 with ApiResponse envelope containing comment list")
    void getComments_returns200WithEnvelopedComments() throws Exception {
        UUID postId = UUID.randomUUID();
        when(commentService.getComments(postId)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/posts/{postId}/comments", postId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        verify(commentService, times(1)).getComments(postId);
    }

    // ── POST /api/v1/posts/{postId}/comments ─────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /posts/{postId}/comments → 201 with created comment")
    void addComment_returns201WithCreatedComment() throws Exception {
        UUID postId = UUID.randomUUID();
        Comment comment = new Comment();
        comment.setCommentId(UUID.randomUUID());
        comment.setBody("Great post!");

        when(commentService.addComment(eq(postId), any(UUID.class), eq("Great post!"))).thenReturn(comment);

        mockMvc.perform(post("/api/v1/posts/{postId}/comments", postId).with(csrf())
                        .contentType("application/json")
                        .content("{\"body\":\"Great post!\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.body").value("Great post!"));

        verify(commentService, times(1)).addComment(eq(postId), any(UUID.class), eq("Great post!"));
    }

    // ── DELETE /api/v1/posts/{postId} ─────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /posts/{postId} → 204 when post deleted by owner")
    void delete_returns204_whenOwner() throws Exception {
        UUID postId = UUID.randomUUID();
        doNothing().when(postService).delete(eq(postId), any(UUID.class));

        mockMvc.perform(delete("/api/v1/posts/{postId}", postId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(postService, times(1)).delete(eq(postId), any(UUID.class));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /posts/{postId} → 403 when non-owner tries to delete")
    void delete_returns403_whenNotOwner() throws Exception {
        UUID postId = UUID.randomUUID();
        doThrow(new ResponseStatusException(FORBIDDEN, "Not your post"))
                .when(postService).delete(eq(postId), any(UUID.class));

        mockMvc.perform(delete("/api/v1/posts/{postId}", postId).with(csrf()))
                .andExpect(status().isForbidden());

        verify(postService, times(1)).delete(eq(postId), any(UUID.class));
    }
}
