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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for CourseProgressController using MockMvc.
 */
@WebMvcTest(CourseProgressController.class)
@DisplayName("CourseProgressController Unit Tests")
class CourseProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseProgressService courseProgressService;

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("Should return 200 with progress list when progress exists for user")
    void getMyProgress_returns200WithProgressList() throws Exception {
        // Arrange
        CourseProgress progress = new CourseProgress();
        progress.setCourseProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");
        progress.setModuleId("cs101-m1");

        when(courseProgressService.getByUserId(any(UUID.class))).thenReturn(List.of(progress));

        // Act & Assert
        mockMvc.perform(get("/api/v1/course-progress/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value("cs101"));

        verify(courseProgressService, times(1)).getByUserId(any(UUID.class));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("Should return 200 with filtered progress list for user and course")
    void getMyCourseProgress_returns200WithFilteredList() throws Exception {
        // Arrange
        CourseProgress progress = new CourseProgress();
        progress.setCourseProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");
        progress.setModuleId("cs101-m1");

        when(courseProgressService.getByUserIdAndCourseId(any(UUID.class), eq("cs101")))
                .thenReturn(List.of(progress));

        // Act & Assert
        mockMvc.perform(get("/api/v1/course-progress/me/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].moduleId").value("cs101-m1"));

        verify(courseProgressService, times(1)).getByUserIdAndCourseId(any(UUID.class), eq("cs101"));
    }
}
