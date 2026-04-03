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

import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for BadgeController using MockMvc.
 */
@WebMvcTest(BadgeController.class)
@DisplayName("BadgeController Unit Tests")
class BadgeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BadgeService badgeService;

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with badge list when badges exist")
    void getAll_returns200WithBadgeList() throws Exception {
        // Arrange
        Badge badge = new Badge();
        badge.setBadgeId("first-login");
        badge.setDescription("Logged in for the first time");

        when(badgeService.getAll()).thenReturn(List.of(badge));

        // Act & Assert
        mockMvc.perform(get("/api/v1/badges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].badgeId").value("first-login"))
                .andExpect(jsonPath("$[0].description").value("Logged in for the first time"));

        verify(badgeService, times(1)).getAll();
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with badge when badge exists")
    void getById_returns200_whenBadgeExists() throws Exception {
        // Arrange
        Badge badge = new Badge();
        badge.setBadgeId("first-login");
        badge.setDescription("Logged in for the first time");

        when(badgeService.getById("first-login")).thenReturn(badge);

        // Act & Assert
        mockMvc.perform(get("/api/v1/badges/first-login"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Logged in for the first time"));

        verify(badgeService, times(1)).getById("first-login");
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 404 when badge does not exist")
    void getById_returns404_whenBadgeNotFound() throws Exception {
        // Arrange
        when(badgeService.getById("missing"))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Badge not found"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/badges/missing"))
                .andExpect(status().isNotFound());

        verify(badgeService, times(1)).getById("missing");
    }
}
