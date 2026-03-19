package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Course;
import com.genalpha.learningplatform.service.CourseService;
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
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    @Test
    @WithMockUser
    void getAll_returns200WithCourseList() throws Exception {
        Course course = new Course();
        course.setCourseId("cs101");
        course.setDescription("Intro to CS");

        when(courseService.getAll()).thenReturn(List.of(course));

        mockMvc.perform(get("/api/v1/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value("cs101"));
    }

    @Test
    @WithMockUser
    void getById_returns200_whenCourseExists() throws Exception {
        Course course = new Course();
        course.setCourseId("cs101");
        course.setDescription("Intro to CS");

        when(courseService.getById("cs101")).thenReturn(course);

        mockMvc.perform(get("/api/v1/courses/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Intro to CS"));
    }
}
