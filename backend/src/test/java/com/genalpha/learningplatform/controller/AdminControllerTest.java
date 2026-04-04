package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.service.ModerationService;
import com.genalpha.learningplatform.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Black-box controller tests for AdminController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(AdminController.class)
@DisplayName("AdminController Black-Box Tests")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private ModerationService moderationService;

    // ── GET /api/v1/admin/users ───────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /admin/users → 200 with ApiResponse envelope when requester is admin")
    void getAllUsers_returns200WithEnvelopedUserList_whenAdmin() throws Exception {
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setName("Alice");

        when(userService.isAdmin(any(UUID.class))).thenReturn(true);
        when(userService.getAll()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Alice"));

        verify(userService, times(1)).isAdmin(any(UUID.class));
        verify(userService, times(1)).getAll();
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /admin/users → 403 when requester is not admin")
    void getAllUsers_returns403_whenNotAdmin() throws Exception {
        when(userService.isAdmin(any(UUID.class))).thenReturn(false);

        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isForbidden());

        verify(userService, times(1)).isAdmin(any(UUID.class));
        verify(userService, never()).getAll();
    }

    // ── PATCH /api/v1/admin/users/{userId}/role ───────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("PATCH /admin/users/{userId}/role → 200 with updated user role")
    void updateRole_returns200WithUpdatedUser() throws Exception {
        UUID targetId = UUID.randomUUID();
        User user = new User();
        user.setUserId(targetId);
        user.setRole("Admin");

        when(userService.updateRole(eq(targetId), eq("Admin"), any(UUID.class))).thenReturn(user);

        mockMvc.perform(patch("/api/v1/admin/users/{userId}/role", targetId).with(csrf())
                        .contentType("application/json")
                        .content("{\"role\":\"Admin\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("Admin"));

        verify(userService, times(1)).updateRole(eq(targetId), eq("Admin"), any(UUID.class));
    }

    // ── DELETE /api/v1/admin/users/{userId} ───────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /admin/users/{userId} → 204 when user deleted successfully")
    void deleteUser_returns204_whenDeleted() throws Exception {
        UUID targetId = UUID.randomUUID();
        doNothing().when(userService).deleteUser(eq(targetId), any(UUID.class));

        mockMvc.perform(delete("/api/v1/admin/users/{userId}", targetId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(userService, times(1)).deleteUser(eq(targetId), any(UUID.class));
    }

    // ── GET /api/v1/admin/reports ─────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /admin/reports → 200 with ApiResponse envelope containing reported posts when admin")
    void getReportedPosts_returns200WithEnvelopedList_whenAdmin() throws Exception {
        when(userService.isAdmin(any(UUID.class))).thenReturn(true);
        when(moderationService.getReportedPosts()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/admin/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        verify(moderationService, times(1)).getReportedPosts();
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /admin/reports → 403 when requester is not admin")
    void getReportedPosts_returns403_whenNotAdmin() throws Exception {
        when(userService.isAdmin(any(UUID.class))).thenReturn(false);

        mockMvc.perform(get("/api/v1/admin/reports"))
                .andExpect(status().isForbidden());

        verify(moderationService, never()).getReportedPosts();
    }

    // ── POST /api/v1/admin/reports/{postId}/approve ───────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /admin/reports/{postId}/approve → 200 with null data on success")
    void approvePost_returns200OnSuccess() throws Exception {
        UUID postId = UUID.randomUUID();
        doNothing().when(moderationService).approvePost(eq(postId), any(UUID.class));

        mockMvc.perform(post("/api/v1/admin/reports/{postId}/approve", postId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(moderationService, times(1)).approvePost(eq(postId), any(UUID.class));
    }

    // ── DELETE /api/v1/admin/reports/{postId} ────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /admin/reports/{postId} → 204 when reported post deleted")
    void deleteReportedPost_returns204_whenDeleted() throws Exception {
        UUID postId = UUID.randomUUID();
        doNothing().when(moderationService).deleteReportedPost(eq(postId), any(UUID.class));

        mockMvc.perform(delete("/api/v1/admin/reports/{postId}", postId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(moderationService, times(1)).deleteReportedPost(eq(postId), any(UUID.class));
    }
}
