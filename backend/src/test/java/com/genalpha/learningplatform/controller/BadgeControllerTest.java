package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Badge;
import com.genalpha.learningplatform.service.BadgeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Black-box controller tests for BadgeController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(BadgeController.class)
@DisplayName("BadgeController Black-Box Tests")
class BadgeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BadgeService badgeService;

    // ── GET /api/v1/badges ────────────────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /badges → 200 with ApiResponse envelope containing badge list")
    void getAll_returns200WithEnvelopedBadgeList() throws Exception {
        Badge badge = new Badge();
        badge.setBadgeId("first-login");
        badge.setDescription("Logged in for the first time");

        when(badgeService.getAll()).thenReturn(List.of(badge));

        mockMvc.perform(get("/api/v1/badges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].badgeId").value("first-login"))
                .andExpect(jsonPath("$.data[0].description").value("Logged in for the first time"));

        verify(badgeService, times(1)).getAll();
    }

    // ── GET /api/v1/badges/{badgeId} ─────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /badges/{badgeId} → 200 with ApiResponse envelope when badge exists")
    void getById_returns200WithEnvelopedBadge() throws Exception {
        Badge badge = new Badge();
        badge.setBadgeId("first-login");
        badge.setDescription("Logged in for the first time");

        when(badgeService.getById("first-login")).thenReturn(badge);

        mockMvc.perform(get("/api/v1/badges/first-login"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.description").value("Logged in for the first time"));

        verify(badgeService, times(1)).getById("first-login");
    }

    @Test
    @WithMockUser
    @DisplayName("GET /badges/{badgeId} → 404 when badge does not exist")
    void getById_returns404_whenBadgeNotFound() throws Exception {
        when(badgeService.getById("missing"))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Badge not found"));

        mockMvc.perform(get("/api/v1/badges/missing"))
                .andExpect(status().isNotFound());

        verify(badgeService, times(1)).getById("missing");
    }

    // ── POST /api/v1/badges ───────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /badges → 201 with created badge")
    void create_returns201WithCreatedBadge() throws Exception {
        Badge badge = new Badge();
        badge.setBadgeId("streak-7");
        badge.setDescription("7-day streak");

        when(badgeService.create(any(Badge.class), any())).thenReturn(badge);

        mockMvc.perform(post("/api/v1/badges").with(csrf())
                        .contentType("application/json")
                        .content("{\"badgeId\":\"streak-7\",\"description\":\"7-day streak\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.badgeId").value("streak-7"));

        verify(badgeService, times(1)).create(any(Badge.class), any());
    }

    // ── DELETE /api/v1/badges/{badgeId} ──────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /badges/{badgeId} → 204 when badge deleted successfully")
    void delete_returns204_whenDeleted() throws Exception {
        doNothing().when(badgeService).delete(eq("first-login"), any());

        mockMvc.perform(delete("/api/v1/badges/first-login").with(csrf()))
                .andExpect(status().isNoContent());

        verify(badgeService, times(1)).delete(eq("first-login"), any());
    }
}
