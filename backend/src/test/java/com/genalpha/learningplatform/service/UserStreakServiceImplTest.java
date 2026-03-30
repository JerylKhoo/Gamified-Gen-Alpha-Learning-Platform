package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.UserStreak;
import com.genalpha.learningplatform.repository.UserStreakRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserStreakServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserStreakServiceImpl Unit Tests")
class UserStreakServiceImplTest {

    @Mock
    private UserStreakRepository userStreakRepository;

    @InjectMocks
    private UserStreakServiceImpl userStreakService;

    private UUID userId;
    private UserStreak streak;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        streak = new UserStreak();
        streak.setUserId(userId);
        streak.setCurrentStreak(3);
        streak.setLongestStreak(5);
        streak.setLastActivityDate(LocalDate.now().minusDays(1));
    }

    @Test
    @DisplayName("Should return existing streak when streak exists for user")
    void getMyStreak_returnsExistingStreak() {
        // Arrange
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));

        // Act
        UserStreak result = userStreakService.getMyStreak(userId);

        // Assert
        assertNotNull(result);
        assertEquals(3, result.getCurrentStreak());
        verify(userStreakRepository, times(1)).findByUserId(userId);
    }

    @Test
    @DisplayName("Should create new streak when no streak exists for user")
    void getMyStreak_createsNewStreak_whenNotExists() {
        // Arrange
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userStreakRepository.save(any(UserStreak.class))).thenReturn(streak);

        // Act
        userStreakService.getMyStreak(userId);

        // Assert
        verify(userStreakRepository, times(1)).findByUserId(userId);
        verify(userStreakRepository, times(1)).save(any(UserStreak.class));
    }

    @Test
    @DisplayName("Should increment streak when last activity was yesterday")
    void recordActivity_incrementsStreak_whenLastActivityWasYesterday() {
        // Arrange
        streak.setLastActivityDate(LocalDate.now().minusDays(1));
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));
        when(userStreakRepository.save(any(UserStreak.class))).thenReturn(streak);

        // Act
        UserStreak result = userStreakService.recordActivity(userId);

        // Assert
        assertNotNull(result);
        assertEquals(4, result.getCurrentStreak());
        verify(userStreakRepository, times(1)).findByUserId(userId);
        verify(userStreakRepository, times(1)).save(any(UserStreak.class));
    }

    @Test
    @DisplayName("Should reset streak when last activity was more than one day ago")
    void recordActivity_resetsStreak_whenLastActivityWasMoreThanOneDayAgo() {
        // Arrange
        streak.setLastActivityDate(LocalDate.now().minusDays(3));
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));
        when(userStreakRepository.save(any(UserStreak.class))).thenReturn(streak);

        // Act
        UserStreak result = userStreakService.recordActivity(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getCurrentStreak());
        verify(userStreakRepository, times(1)).findByUserId(userId);
        verify(userStreakRepository, times(1)).save(any(UserStreak.class));
    }

    @Test
    @DisplayName("Should not change streak when activity already recorded today")
    void recordActivity_doesNotChangeStreak_whenActivityAlreadyRecordedToday() {
        // Arrange
        streak.setLastActivityDate(LocalDate.now());
        streak.setCurrentStreak(3);
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));

        // Act
        UserStreak result = userStreakService.recordActivity(userId);

        // Assert
        assertNotNull(result);
        assertEquals(3, result.getCurrentStreak());
        verify(userStreakRepository, times(1)).findByUserId(userId);
        verify(userStreakRepository, never()).save(any());
    }
}
