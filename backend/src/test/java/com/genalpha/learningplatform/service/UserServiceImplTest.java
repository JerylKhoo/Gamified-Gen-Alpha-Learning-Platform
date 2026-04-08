package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.ChatBotRepository;
import com.genalpha.learningplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserServiceImpl.
 * RestTemplate is constructed as a real instance (not mocked) because
 * Mockito cannot mock final/complex Spring classes on Java 25.
 * The repository and chatBotRepository remain mocked.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl Unit Tests")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ChatBotRepository chatBotRepository;

    private UserServiceImpl userService;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userRepository, chatBotRepository, new RestTemplate());
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

    // ── CSD-261: promoteToCollaboratorIfEligible threshold logic ─────────────

    @Test
    @DisplayName("Should promote User to Collaborator when points == 80,000 (exact threshold)")
    void promote_promotesUser_whenPointsExactlyAtThreshold() {
        user.setPoints(80_000);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User promoted = new User();
        promoted.setUserId(userId);
        promoted.setRole("Collaborator");
        promoted.setPoints(80_000);
        // second findById call (after updateRole) returns updated user
        when(userRepository.findById(userId)).thenReturn(Optional.of(user)).thenReturn(Optional.of(promoted));

        User result = userService.promoteToCollaboratorIfEligible(userId);

        assertEquals("Collaborator", result.getRole());
        verify(userRepository).updateRole(userId, "Collaborator");
    }

    @Test
    @DisplayName("Should promote User to Collaborator when points > 80,000")
    void promote_promotesUser_whenPointsAboveThreshold() {
        user.setPoints(95_000);
        User promoted = new User();
        promoted.setUserId(userId);
        promoted.setRole("Collaborator");
        promoted.setPoints(95_000);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user)).thenReturn(Optional.of(promoted));

        User result = userService.promoteToCollaboratorIfEligible(userId);

        assertEquals("Collaborator", result.getRole());
        verify(userRepository).updateRole(userId, "Collaborator");
    }

    @Test
    @DisplayName("Should not promote User when points < 80,000 (below threshold)")
    void promote_doesNotPromote_whenPointsBelowThreshold() {
        user.setPoints(79_999);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User result = userService.promoteToCollaboratorIfEligible(userId);

        assertEquals("User", result.getRole());
        verify(userRepository, never()).updateRole(any(), any());
    }

    @Test
    @DisplayName("Should not promote and return unchanged when user is already Collaborator (idempotent)")
    void promote_isIdempotent_whenAlreadyCollaborator() {
        user.setRole("Collaborator");
        user.setPoints(100_000);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User result = userService.promoteToCollaboratorIfEligible(userId);

        assertEquals("Collaborator", result.getRole());
        verify(userRepository, never()).updateRole(any(), any());
    }

    @Test
    @DisplayName("Should not promote and return unchanged when user is Admin (idempotent)")
    void promote_isIdempotent_whenAlreadyAdmin() {
        user.setRole("Admin");
        user.setPoints(100_000);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User result = userService.promoteToCollaboratorIfEligible(userId);

        assertEquals("Admin", result.getRole());
        verify(userRepository, never()).updateRole(any(), any());
    }

    @Test
    @DisplayName("Should treat null points as 0 and not promote")
    void promote_doesNotPromote_whenPointsIsNull() {
        user.setPoints(null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User result = userService.promoteToCollaboratorIfEligible(userId);

        assertEquals("User", result.getRole());
        verify(userRepository, never()).updateRole(any(), any());
    }

    @Test
    @DisplayName("Should throw 404 when user does not exist")
    void promote_throwsNotFound_whenUserDoesNotExist() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> userService.promoteToCollaboratorIfEligible(userId));
        verify(userRepository, never()).updateRole(any(), any());
    }
}
