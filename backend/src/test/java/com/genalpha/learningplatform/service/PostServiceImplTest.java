package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PostServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
class PostServiceImplTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private PostServiceImpl postService;

    private UUID userId;
    private Post post;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        post = new Post();
        post.setPostId(UUID.randomUUID());
        post.setUserId(userId);
        post.setTitle("My Post");
        post.setDescription("Some content");
        post.setReportCount(0);
        post.setUpvote(0);
    }

    @Test
    void getAll_returnsAllPosts() {
        when(postRepository.findAll()).thenReturn(List.of(post));

        List<Post> result = postService.getAll();

        assertThat(result).hasSize(1);
    }

    @Test
    void getById_returnsPost_whenFound() {
        when(postRepository.findById(post.getPostId())).thenReturn(Optional.of(post));

        Post result = postService.getById(post.getPostId());

        assertThat(result.getTitle()).isEqualTo("My Post");
    }

    @Test
    void getById_throwsNotFound_whenMissing() {
        UUID randomId = UUID.randomUUID();
        when(postRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getById(randomId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Post not found");
    }

    @Test
    void create_savesPost_withRequesterIdAsOwner() {
        when(postRepository.save(any(Post.class))).thenReturn(post);

        Post input = new Post();
        input.setTitle("New Post");
        postService.create(input, userId);

        verify(postRepository).save(any(Post.class));
    }

    @Test
    void delete_throwsForbidden_whenNotOwnerAndNotAdmin() {
        UUID otherId = UUID.randomUUID();
        when(postRepository.findById(post.getPostId())).thenReturn(Optional.of(post));
        when(userService.isAdmin(otherId)).thenReturn(false);

        assertThatThrownBy(() -> postService.delete(post.getPostId(), otherId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cannot delete another user's post");
    }

    @Test
    void delete_succeedsWhenAdmin() {
        UUID adminId = UUID.randomUUID();
        when(postRepository.findById(post.getPostId())).thenReturn(Optional.of(post));
        when(userService.isAdmin(adminId)).thenReturn(true);

        postService.delete(post.getPostId(), adminId);

        verify(postRepository).delete(post);
    }
}
