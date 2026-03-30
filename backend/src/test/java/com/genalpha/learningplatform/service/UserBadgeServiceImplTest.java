package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.UserBadge;
import com.genalpha.learningplatform.repository.BadgeRepository;
import com.genalpha.learningplatform.repository.UserBadgeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserBadgeServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserBadgeServiceImpl Unit Tests")
class UserBadgeServiceImplTest {

    @Mock
    private UserBadgeRepository userBadgeRepository;

    @Mock
    private BadgeRepository badgeRepository;

    @InjectMocks
    private UserBadgeServiceImpl userBadgeService;

    private UUID userId;
    private UserBadge userBadge;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        userBadge = new UserBadge();
        userBadge.setUserBadgeId(UUID.randomUUID());
        userBadge.setUserId(userId);
        userBadge.setBadgeId("first-login");
        userBadge.setEarnedAt(Instant.now());
    }

    @Test
    @DisplayName("Should return badge list when badges exist for user")
    void getMyBadges_returnsBadgeList() {
        // Arrange
        List<UserBadge> expectedBadges = List.of(userBadge);
        when(userBadgeRepository.findByUserId(userId)).thenReturn(expectedBadges);

        // Act
        List<UserBadge> result = userBadgeService.getMyBadges(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("first-login", result.get(0).getBadgeId());
        verify(userBadgeRepository, times(1)).findByUserId(userId);
    }

    @Test
    @DisplayName("Should return user badge when requester is the owner")
    void getById_returnsUserBadge_whenOwner() {
        // Arrange
        UUID ubId = userBadge.getUserBadgeId();
        when(userBadgeRepository.findById(ubId)).thenReturn(Optional.of(userBadge));

        // Act
        UserBadge result = userBadgeService.getById(ubId, userId);

        // Assert
        assertNotNull(result);
        assertEquals("first-login", result.getBadgeId());
        verify(userBadgeRepository, times(1)).findById(ubId);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not the owner")
    void getById_throwsForbidden_whenNotOwner() {
        // Arrange
        UUID ubId = userBadge.getUserBadgeId();
        UUID otherId = UUID.randomUUID();
        when(userBadgeRepository.findById(ubId)).thenReturn(Optional.of(userBadge));

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> userBadgeService.getById(ubId, otherId));
        assertNotNull(exception);
        verify(userBadgeRepository, times(1)).findById(ubId);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when user badge does not exist")
    void getById_throwsNotFound_whenMissing() {
        // Arrange
        UUID missingId = UUID.randomUUID();
        when(userBadgeRepository.findById(missingId)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> userBadgeService.getById(missingId, userId));
        assertNotNull(exception);
        verify(userBadgeRepository, times(1)).findById(missingId);
    }

    @Test
    @DisplayName("Should save new badge when badge has not already been earned")
    void award_savesNewBadge_whenNotAlreadyEarned() {
        // Arrange
        when(badgeRepository.existsById("first-login")).thenReturn(true);
        when(userBadgeRepository.existsByUserIdAndBadgeId(userId, "first-login")).thenReturn(false);
        when(userBadgeRepository.save(any(UserBadge.class))).thenReturn(userBadge);

        // Act
        UserBadge result = userBadgeService.award("first-login", userId);

        // Assert
        assertNotNull(result);
        assertEquals("first-login", result.getBadgeId());
        verify(badgeRepository, times(1)).existsById("first-login");
        verify(userBadgeRepository, times(1)).existsByUserIdAndBadgeId(userId, "first-login");
        verify(userBadgeRepository, times(1)).save(any(UserBadge.class));
    }

    @Test
    @DisplayName("Should return existing badge when badge has already been earned")
    void award_returnsExisting_whenAlreadyEarned() {
        // Arrange
        when(badgeRepository.existsById("first-login")).thenReturn(true);
        when(userBadgeRepository.existsByUserIdAndBadgeId(userId, "first-login")).thenReturn(true);
        when(userBadgeRepository.findByUserId(userId)).thenReturn(List.of(userBadge));

        // Act
        UserBadge result = userBadgeService.award("first-login", userId);

        // Assert
        assertNotNull(result);
        assertEquals(userBadge.getUserBadgeId(), result.getUserBadgeId());
        verify(badgeRepository, times(1)).existsById("first-login");
        verify(userBadgeRepository, times(1)).existsByUserIdAndBadgeId(userId, "first-login");
        verify(userBadgeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when badge does not exist")
    void award_throwsNotFound_whenBadgeDoesNotExist() {
        // Arrange
        when(badgeRepository.existsById("nonexistent")).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> userBadgeService.award("nonexistent", userId));
        assertNotNull(exception);
        verify(badgeRepository, times(1)).existsById("nonexistent");
        verify(userBadgeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete user badge when requester is the owner")
    void delete_deletesUserBadge_whenOwner() {
        // Arrange
        UUID ubId = userBadge.getUserBadgeId();
        when(userBadgeRepository.findById(ubId)).thenReturn(Optional.of(userBadge));

        // Act
        userBadgeService.delete(ubId, userId);

        // Assert
        verify(userBadgeRepository, times(1)).findById(ubId);
        verify(userBadgeRepository, times(1)).delete(userBadge);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not the owner and tries to delete")
    void delete_throwsForbidden_whenNotOwner() {
        // Arrange
        UUID ubId = userBadge.getUserBadgeId();
        UUID otherId = UUID.randomUUID();
        when(userBadgeRepository.findById(ubId)).thenReturn(Optional.of(userBadge));

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> userBadgeService.delete(ubId, otherId));
        assertNotNull(exception);
        verify(userBadgeRepository, times(1)).findById(ubId);
        verify(userBadgeRepository, never()).delete(any());
    }
}
