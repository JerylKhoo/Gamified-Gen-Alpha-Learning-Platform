package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Course;
import com.genalpha.learningplatform.service.CourseService;
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
 * Black-box controller tests for CourseController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(CourseController.class)
@DisplayName("CourseController Black-Box Tests")
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    // ── GET /api/v1/courses ───────────────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /courses → 200 with ApiResponse envelope containing course list")
    void getAll_returns200WithEnvelopedCourseList() throws Exception {
        Course course = new Course();
        course.setCourseId("cs101");
        course.setDescription("Intro to CS");

        when(courseService.getAll()).thenReturn(List.of(course));

        mockMvc.perform(get("/api/v1/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].courseId").value("cs101"));

        verify(courseService, times(1)).getAll();
    }

    // ── GET /api/v1/courses/{courseId} ────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /courses/{courseId} → 200 with ApiResponse envelope when course exists")
    void getById_returns200WithEnvelopedCourse() throws Exception {
        Course course = new Course();
        course.setCourseId("cs101");
        course.setDescription("Intro to CS");

        when(courseService.getById("cs101")).thenReturn(course);

        mockMvc.perform(get("/api/v1/courses/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.description").value("Intro to CS"));

        verify(courseService, times(1)).getById("cs101");
    }

    @Test
    @WithMockUser
    @DisplayName("GET /courses/{courseId} → 404 when course does not exist")
    void getById_returns404_whenCourseNotFound() throws Exception {
        when(courseService.getById("missing"))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Course not found"));

        mockMvc.perform(get("/api/v1/courses/missing"))
                .andExpect(status().isNotFound());

        verify(courseService, times(1)).getById("missing");
    }

    // ── POST /api/v1/courses ──────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /courses → 201 with created course")
    void create_returns201WithCreatedCourse() throws Exception {
        Course course = new Course();
        course.setCourseId("cs202");
        course.setDescription("Data Structures");

        when(courseService.create(any(Course.class), any())).thenReturn(course);

        mockMvc.perform(post("/api/v1/courses").with(csrf())
                        .contentType("application/json")
                        .content("{\"courseId\":\"cs202\",\"description\":\"Data Structures\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.courseId").value("cs202"));

        verify(courseService, times(1)).create(any(Course.class), any());
    }

    // ── DELETE /api/v1/courses/{courseId} ─────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /courses/{courseId} → 204 when course deleted successfully")
    void delete_returns204_whenDeleted() throws Exception {
        doNothing().when(courseService).delete(eq("cs101"), any());

        mockMvc.perform(delete("/api/v1/courses/cs101").with(csrf()))
                .andExpect(status().isNoContent());

        verify(courseService, times(1)).delete(eq("cs101"), any());
    }
}
