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
 * Black-box controller tests for UserStreakController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(UserStreakController.class)
@DisplayName("UserStreakController Black-Box Tests")
class UserStreakControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserStreakService userStreakService;

    // ── GET /api/v1/streaks/me ────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /streaks/me → 200 with ApiResponse envelope containing streak")
    void getMyStreak_returns200WithEnvelopedStreak() throws Exception {
        UserStreak streak = new UserStreak();
        streak.setCurrentStreak(5);
        streak.setLongestStreak(10);
        streak.setLastActivityDate(LocalDate.now());

        when(userStreakService.getMyStreak(any(UUID.class))).thenReturn(streak);

        mockMvc.perform(get("/api/v1/streaks/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currentStreak").value(5))
                .andExpect(jsonPath("$.data.longestStreak").value(10));

        verify(userStreakService, times(1)).getMyStreak(any(UUID.class));
    }

    // ── POST /api/v1/streaks/me/activity ─────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /streaks/me/activity → 200 with ApiResponse envelope containing updated streak")
    void recordActivity_returns200WithEnvelopedUpdatedStreak() throws Exception {
        UserStreak streak = new UserStreak();
        streak.setCurrentStreak(6);
        streak.setLongestStreak(10);

        when(userStreakService.recordActivity(any(UUID.class))).thenReturn(streak);

        mockMvc.perform(post("/api/v1/streaks/me/activity").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currentStreak").value(6));

        verify(userStreakService, times(1)).recordActivity(any(UUID.class));
    }

    // ── DELETE /api/v1/streaks/{streakId} ─────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /streaks/{streakId} → 204 when streak deleted successfully")
    void delete_returns204_whenDeleted() throws Exception {
        UUID streakId = UUID.randomUUID();
        doNothing().when(userStreakService).delete(eq(streakId), any(UUID.class));

        mockMvc.perform(delete("/api/v1/streaks/{streakId}", streakId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(userStreakService, times(1)).delete(eq(streakId), any(UUID.class));
    }
}
