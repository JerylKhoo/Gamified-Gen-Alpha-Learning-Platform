package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.CourseProgress;
import com.genalpha.learningplatform.service.CourseProgressService;
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
 * Black-box controller tests for CourseProgressController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(CourseProgressController.class)
@DisplayName("CourseProgressController Black-Box Tests")
class CourseProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseProgressService courseProgressService;

    // ── GET /api/v1/course-progress/me ────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /course-progress/me → 200 with ApiResponse envelope containing progress list")
    void getMyProgress_returns200WithEnvelopedProgressList() throws Exception {
        CourseProgress progress = new CourseProgress();
        progress.setCourseProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");
        progress.setModuleId("cs101-m1");

        when(courseProgressService.getByUserId(any(UUID.class))).thenReturn(List.of(progress));

        mockMvc.perform(get("/api/v1/course-progress/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].courseId").value("cs101"));

        verify(courseProgressService, times(1)).getByUserId(any(UUID.class));
    }

    // ── GET /api/v1/course-progress/me/{courseId} ─────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /course-progress/me/{courseId} → 200 with ApiResponse envelope filtered by course")
    void getMyCourseProgress_returns200WithEnvelopedFilteredList() throws Exception {
        CourseProgress progress = new CourseProgress();
        progress.setCourseProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");
        progress.setModuleId("cs101-m1");

        when(courseProgressService.getByUserIdAndCourseId(any(UUID.class), eq("cs101")))
                .thenReturn(List.of(progress));

        mockMvc.perform(get("/api/v1/course-progress/me/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].moduleId").value("cs101-m1"));

        verify(courseProgressService, times(1)).getByUserIdAndCourseId(any(UUID.class), eq("cs101"));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /course-progress/me/{courseId} → 200 with empty list when no progress")
    void getMyCourseProgress_returns200WithEmptyList_whenNoneFound() throws Exception {
        when(courseProgressService.getByUserIdAndCourseId(any(UUID.class), eq("new-course")))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/course-progress/me/new-course"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        verify(courseProgressService, times(1)).getByUserIdAndCourseId(any(UUID.class), eq("new-course"));
    }

    // ── POST /api/v1/course-progress ─────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /course-progress → 201 with created progress record")
    void create_returns201WithCreatedProgress() throws Exception {
        CourseProgress progress = new CourseProgress();
        progress.setCourseProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");
        progress.setModuleId("cs101-m1");

        when(courseProgressService.create(any(CourseProgress.class), any(UUID.class))).thenReturn(progress);

        mockMvc.perform(post("/api/v1/course-progress").with(csrf())
                        .contentType("application/json")
                        .content("{\"courseId\":\"cs101\",\"moduleId\":\"cs101-m1\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.moduleId").value("cs101-m1"));

        verify(courseProgressService, times(1)).create(any(CourseProgress.class), any(UUID.class));
    }
}
