package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Black-box controller tests for UserController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(UserController.class)
@DisplayName("UserController Black-Box Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    // ── GET /api/v1/users/leaderboard ─────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /leaderboard → 200 with ApiResponse envelope containing user list")
    void getLeaderboard_returns200WithEnvelopedUserList() throws Exception {
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setName("Alice");
        user.setPoints(500);

        when(userService.getLeaderboard()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/v1/users/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Alice"))
                .andExpect(jsonPath("$.data[0].points").value(500));

        verify(userService, times(1)).getLeaderboard();
    }

    @Test
    @WithMockUser
    @DisplayName("GET /leaderboard → 200 with empty list when no users")
    void getLeaderboard_returns200WithEmptyList() throws Exception {
        when(userService.getLeaderboard()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/users/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        verify(userService, times(1)).getLeaderboard();
    }

    // ── GET /api/v1/users/{userId} ────────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /{userId} → 200 with ApiResponse envelope when user exists")
    void getById_returns200WithEnvelopedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setUserId(userId);
        user.setName("Bob");

        when(userService.getById(userId)).thenReturn(user);

        mockMvc.perform(get("/api/v1/users/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Bob"));

        verify(userService, times(1)).getById(userId);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /{userId} → 404 when user does not exist")
    void getById_returns404_whenUserNotFound() throws Exception {
        UUID userId = UUID.randomUUID();
        when(userService.getById(userId))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "User not found"));

        mockMvc.perform(get("/api/v1/users/{userId}", userId))
                .andExpect(status().isNotFound());

        verify(userService, times(1)).getById(userId);
    }

    // ── PUT /api/v1/users/{userId} ────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("PUT /{userId} → 200 with updated user when requester is the owner")
    void update_returns200WithUpdatedUser() throws Exception {
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        User updated = new User();
        updated.setUserId(userId);
        updated.setName("UpdatedName");

        when(userService.update(eq(userId), any(User.class), eq(userId))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/users/{userId}", userId).with(csrf())
                        .contentType("application/json")
                        .content("{\"name\":\"UpdatedName\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("UpdatedName"));

        verify(userService, times(1)).update(eq(userId), any(User.class), eq(userId));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("PUT /{userId} → 403 when requester tries to update another user")
    void update_returns403_whenNotOwner() throws Exception {
        UUID targetId = UUID.randomUUID();
        UUID requesterId = UUID.fromString("00000000-0000-0000-0000-000000000001");

        when(userService.update(eq(targetId), any(User.class), eq(requesterId)))
                .thenThrow(new ResponseStatusException(FORBIDDEN, "Cannot update another user's profile"));

        mockMvc.perform(put("/api/v1/users/{userId}", targetId).with(csrf())
                        .contentType("application/json")
                        .content("{\"name\":\"Hacker\"}"))
                .andExpect(status().isForbidden());

        verify(userService, times(1)).update(eq(targetId), any(User.class), eq(requesterId));
    }
}
