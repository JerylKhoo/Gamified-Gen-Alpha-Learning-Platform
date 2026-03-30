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

import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for UserController using MockMvc.
 * The service layer is mocked so no database is required.
 */
@WebMvcTest(UserController.class)
@DisplayName("UserController Unit Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with user list when leaderboard is requested")
    void getLeaderboard_returns200WithUserList() throws Exception {
        // Arrange
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setName("Alice");
        user.setPoints(500);

        when(userService.getLeaderboard()).thenReturn(List.of(user));

        // Act & Assert
        mockMvc.perform(get("/api/v1/users/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alice"));

        verify(userService, times(1)).getLeaderboard();
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with user when user exists")
    void getById_returns200_whenUserExists() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setUserId(userId);
        user.setName("Bob");

        when(userService.getById(userId)).thenReturn(user);

        // Act & Assert
        mockMvc.perform(get("/api/v1/users/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Bob"));

        verify(userService, times(1)).getById(userId);
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 404 when user does not exist")
    void getById_returns404_whenUserNotFound() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userService.getById(userId))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "User not found"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/users/{userId}", userId))
                .andExpect(status().isNotFound());

        verify(userService, times(1)).getById(userId);
    }
}
