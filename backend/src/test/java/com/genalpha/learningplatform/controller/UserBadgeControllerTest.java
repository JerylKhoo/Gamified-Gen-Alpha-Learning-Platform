package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.UserBadge;
import com.genalpha.learningplatform.service.UserBadgeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Black-box controller tests for UserBadgeController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(UserBadgeController.class)
@DisplayName("UserBadgeController Black-Box Tests")
class UserBadgeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserBadgeService userBadgeService;

    // ── GET /api/v1/user-badges/me ────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /user-badges/me → 200 with ApiResponse envelope containing badge list")
    void getMyBadges_returns200WithEnvelopedBadgeList() throws Exception {
        UserBadge ub = new UserBadge();
        ub.setUserBadgeId(UUID.randomUUID());
        ub.setBadgeId("first-login");
        ub.setEarnedAt(Instant.now());

        when(userBadgeService.getMyBadges(any(UUID.class))).thenReturn(List.of(ub));

        mockMvc.perform(get("/api/v1/user-badges/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].badgeId").value("first-login"));

        verify(userBadgeService, times(1)).getMyBadges(any(UUID.class));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /user-badges/me → 200 with empty list when user has no badges")
    void getMyBadges_returns200WithEmptyList() throws Exception {
        when(userBadgeService.getMyBadges(any(UUID.class))).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/user-badges/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        verify(userBadgeService, times(1)).getMyBadges(any(UUID.class));
    }

    // ── GET /api/v1/user-badges/{userBadgeId} ────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /user-badges/{userBadgeId} → 200 with ApiResponse envelope when owner requests")
    void getById_returns200WithEnvelopedBadge_whenOwner() throws Exception {
        UUID ubId = UUID.randomUUID();
        UserBadge ub = new UserBadge();
        ub.setUserBadgeId(ubId);
        ub.setBadgeId("first-login");

        when(userBadgeService.getById(eq(ubId), any(UUID.class))).thenReturn(ub);

        mockMvc.perform(get("/api/v1/user-badges/{userBadgeId}", ubId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.badgeId").value("first-login"));

        verify(userBadgeService, times(1)).getById(eq(ubId), any(UUID.class));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /user-badges/{userBadgeId} → 403 when requester is not the owner")
    void getById_returns403_whenNotOwner() throws Exception {
        UUID ubId = UUID.randomUUID();
        when(userBadgeService.getById(eq(ubId), any(UUID.class)))
                .thenThrow(new ResponseStatusException(FORBIDDEN, "Access denied"));

        mockMvc.perform(get("/api/v1/user-badges/{userBadgeId}", ubId))
                .andExpect(status().isForbidden());

        verify(userBadgeService, times(1)).getById(eq(ubId), any(UUID.class));
    }
}
