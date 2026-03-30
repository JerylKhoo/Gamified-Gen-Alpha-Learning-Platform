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

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for CourseController using MockMvc.
 */
@WebMvcTest(CourseController.class)
@DisplayName("CourseController Unit Tests")
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with course list when courses exist")
    void getAll_returns200WithCourseList() throws Exception {
        // Arrange
        Course course = new Course();
        course.setCourseId("cs101");
        course.setDescription("Intro to CS");

        when(courseService.getAll()).thenReturn(List.of(course));

        // Act & Assert
        mockMvc.perform(get("/api/v1/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value("cs101"));

        verify(courseService, times(1)).getAll();
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with course when course exists")
    void getById_returns200_whenCourseExists() throws Exception {
        // Arrange
        Course course = new Course();
        course.setCourseId("cs101");
        course.setDescription("Intro to CS");

        when(courseService.getById("cs101")).thenReturn(course);

        // Act & Assert
        mockMvc.perform(get("/api/v1/courses/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Intro to CS"));

        verify(courseService, times(1)).getById("cs101");
    }
}
