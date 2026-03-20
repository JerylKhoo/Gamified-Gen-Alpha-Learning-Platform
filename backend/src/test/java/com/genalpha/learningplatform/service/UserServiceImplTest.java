package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.UserRepository;
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
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserServiceImpl.
 * The repository is mocked so no database connection is needed.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        user.setUserId(userId);
        user.setName("Test User");
        user.setRole("User");
        user.setPoints(100);
    }

    @Test
    void getById_returnsUser_whenUserExists() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User result = userService.getById(userId);

        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getName()).isEqualTo("Test User");
    }

    @Test
    void getById_throwsNotFound_whenUserDoesNotExist() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById(userId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void isAdmin_returnsTrue_whenRoleIsAdmin() {
        user.setRole("Admin");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThat(userService.isAdmin(userId)).isTrue();
    }

    @Test
    void isAdmin_returnsFalse_whenRoleIsUser() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThat(userService.isAdmin(userId)).isFalse();
    }

    @Test
    void isCollaborator_returnsTrue_whenRoleIsCollaborator() {
        user.setRole("Collaborator");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThat(userService.isCollaborator(userId)).isTrue();
    }

    @Test
    void getLeaderboard_returnsSortedByPointsDescending() {
        User userA = new User();
        userA.setUserId(UUID.randomUUID());
        userA.setPoints(50);

        User userB = new User();
        userB.setUserId(UUID.randomUUID());
        userB.setPoints(200);

        when(userRepository.findAll()).thenReturn(List.of(userA, userB));

        List<User> leaderboard = userService.getLeaderboard();

        assertThat(leaderboard.get(0).getPoints()).isEqualTo(200);
        assertThat(leaderboard.get(1).getPoints()).isEqualTo(50);
    }
}
