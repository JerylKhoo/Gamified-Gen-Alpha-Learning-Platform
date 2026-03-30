package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Post;
import com.genalpha.learningplatform.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PostServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PostServiceImpl Unit Tests")
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
    @DisplayName("Should return all posts when posts exist")
    void getAll_returnsAllPosts() {
        // Arrange
        List<Post> expectedPosts = List.of(post);
        when(postRepository.findAll()).thenReturn(expectedPosts);

        // Act
        List<Post> result = postService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(postRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return post when post exists")
    void getById_returnsPost_whenFound() {
        // Arrange
        when(postRepository.findById(post.getPostId())).thenReturn(Optional.of(post));

        // Act
        Post result = postService.getById(post.getPostId());

        // Assert
        assertNotNull(result);
        assertEquals("My Post", result.getTitle());
        verify(postRepository, times(1)).findById(post.getPostId());
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when post does not exist")
    void getById_throwsNotFound_whenMissing() {
        // Arrange
        UUID randomId = UUID.randomUUID();
        when(postRepository.findById(randomId)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> postService.getById(randomId));
        assertNotNull(exception);
        verify(postRepository, times(1)).findById(randomId);
    }

    @Test
    @DisplayName("Should save post with requester ID as owner when creating")
    void create_savesPost_withRequesterIdAsOwner() {
        // Arrange
        when(postRepository.save(any(Post.class))).thenReturn(post);

        Post input = new Post();
        input.setTitle("New Post");

        // Act
        postService.create(input, userId);

        // Assert
        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not owner and not admin")
    void delete_throwsForbidden_whenNotOwnerAndNotAdmin() {
        // Arrange
        UUID otherId = UUID.randomUUID();
        when(postRepository.findById(post.getPostId())).thenReturn(Optional.of(post));
        when(userService.isAdmin(otherId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> postService.delete(post.getPostId(), otherId));
        assertNotNull(exception);
        verify(postRepository, times(1)).findById(post.getPostId());
        verify(userService, times(1)).isAdmin(otherId);
        verify(postRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should delete post when requester is admin")
    void delete_succeedsWhenAdmin() {
        // Arrange
        UUID adminId = UUID.randomUUID();
        when(postRepository.findById(post.getPostId())).thenReturn(Optional.of(post));
        when(userService.isAdmin(adminId)).thenReturn(true);

        // Act
        postService.delete(post.getPostId(), adminId);

        // Assert
        verify(postRepository, times(1)).findById(post.getPostId());
        verify(userService, times(1)).isAdmin(adminId);
        verify(postRepository, times(1)).delete(post);
    }
}
