package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.UserRepository;
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
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserServiceImpl.
 * The repository is mocked so no database connection is needed.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl Unit Tests")
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
    @DisplayName("Should return user when user exists")
    void getById_returnsUser_whenUserExists() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        User result = userService.getById(userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals("Test User", result.getName());
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when user does not exist")
    void getById_throwsNotFound_whenUserDoesNotExist() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> userService.getById(userId));
        assertNotNull(exception);
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("Should return true when user role is Admin")
    void isAdmin_returnsTrue_whenRoleIsAdmin() {
        // Arrange
        user.setRole("Admin");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        boolean result = userService.isAdmin(userId);

        // Assert
        assertTrue(result);
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("Should return false when user role is User")
    void isAdmin_returnsFalse_whenRoleIsUser() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        boolean result = userService.isAdmin(userId);

        // Assert
        assertFalse(result);
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("Should return true when user role is Collaborator")
    void isCollaborator_returnsTrue_whenRoleIsCollaborator() {
        // Arrange
        user.setRole("Collaborator");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        boolean result = userService.isCollaborator(userId);

        // Assert
        assertTrue(result);
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("Should return leaderboard sorted by points descending")
    void getLeaderboard_returnsSortedByPointsDescending() {
        // Arrange
        User userA = new User();
        userA.setUserId(UUID.randomUUID());
        userA.setPoints(50);

        User userB = new User();
        userB.setUserId(UUID.randomUUID());
        userB.setPoints(200);

        when(userRepository.findAll()).thenReturn(List.of(userA, userB));

        // Act
        List<User> leaderboard = userService.getLeaderboard();

        // Assert
        assertNotNull(leaderboard);
        assertEquals(200, leaderboard.get(0).getPoints());
        assertEquals(50, leaderboard.get(1).getPoints());
        verify(userRepository, times(1)).findAll();
    }
}
