package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.UserStreak;
import com.genalpha.learningplatform.repository.UserStreakRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserStreakServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
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
    void getMyStreak_returnsExistingStreak() {
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));

        UserStreak result = userStreakService.getMyStreak(userId);

        assertThat(result.getCurrentStreak()).isEqualTo(3);
    }

    @Test
    void getMyStreak_createsNewStreak_whenNotExists() {
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userStreakRepository.save(any(UserStreak.class))).thenReturn(streak);

        userStreakService.getMyStreak(userId);

        verify(userStreakRepository).save(any(UserStreak.class));
    }

    @Test
    void recordActivity_incrementsStreak_whenLastActivityWasYesterday() {
        streak.setLastActivityDate(LocalDate.now().minusDays(1));
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));
        when(userStreakRepository.save(any(UserStreak.class))).thenReturn(streak);

        UserStreak result = userStreakService.recordActivity(userId);

        assertThat(result.getCurrentStreak()).isEqualTo(4);
    }

    @Test
    void recordActivity_resetsStreak_whenLastActivityWasMoreThanOneDayAgo() {
        streak.setLastActivityDate(LocalDate.now().minusDays(3));
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));
        when(userStreakRepository.save(any(UserStreak.class))).thenReturn(streak);

        UserStreak result = userStreakService.recordActivity(userId);

        assertThat(result.getCurrentStreak()).isEqualTo(1);
    }

    @Test
    void recordActivity_doesNotChangeStreak_whenActivityAlreadyRecordedToday() {
        streak.setLastActivityDate(LocalDate.now());
        streak.setCurrentStreak(3);
        when(userStreakRepository.findByUserId(userId)).thenReturn(Optional.of(streak));

        UserStreak result = userStreakService.recordActivity(userId);

        assertThat(result.getCurrentStreak()).isEqualTo(3);
        verify(userStreakRepository, never()).save(any());
    }
}
