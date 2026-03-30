package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.UserStreak;
import com.genalpha.learningplatform.service.UserStreakService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for UserStreakController using MockMvc.
 */
@WebMvcTest(UserStreakController.class)
@DisplayName("UserStreakController Unit Tests")
class UserStreakControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserStreakService userStreakService;

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("Should return 200 with streak when user streak exists")
    void getMyStreak_returns200WithStreak() throws Exception {
        // Arrange
        UserStreak streak = new UserStreak();
        streak.setCurrentStreak(5);
        streak.setLongestStreak(10);
        streak.setLastActivityDate(LocalDate.now());

        when(userStreakService.getMyStreak(any(UUID.class))).thenReturn(streak);

        // Act & Assert
        mockMvc.perform(get("/api/v1/streaks/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStreak").value(5))
                .andExpect(jsonPath("$.longestStreak").value(10));

        verify(userStreakService, times(1)).getMyStreak(any(UUID.class));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("Should return 200 with updated streak after recording activity")
    void recordActivity_returns200WithUpdatedStreak() throws Exception {
        // Arrange
        UserStreak streak = new UserStreak();
        streak.setCurrentStreak(6);
        streak.setLongestStreak(10);

        when(userStreakService.recordActivity(any(UUID.class))).thenReturn(streak);

        // Act & Assert
        mockMvc.perform(post("/api/v1/streaks/me/activity").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStreak").value(6));

        verify(userStreakService, times(1)).recordActivity(any(UUID.class));
    }
}
