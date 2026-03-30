package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.QuizProgress;
import com.genalpha.learningplatform.service.QuizProgressService;
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
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for QuizProgressController using MockMvc.
 */
@WebMvcTest(QuizProgressController.class)
@DisplayName("QuizProgressController Unit Tests")
class QuizProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuizProgressService quizProgressService;

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("Should return 200 with progress list when progress exists for user")
    void getMyProgress_returns200WithProgressList() throws Exception {
        // Arrange
        QuizProgress progress = new QuizProgress();
        progress.setQuizProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");
        progress.setAdaptiveScore("{}");

        when(quizProgressService.getByUserId(any(UUID.class))).thenReturn(List.of(progress));

        // Act & Assert
        mockMvc.perform(get("/api/v1/quiz-progress/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value("cs101"));

        verify(quizProgressService, times(1)).getByUserId(any(UUID.class));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("Should return 200 with progress when progress exists for user and course")
    void getMyCourseProgress_returns200_whenFound() throws Exception {
        // Arrange
        QuizProgress progress = new QuizProgress();
        progress.setQuizProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");

        when(quizProgressService.getByUserIdAndCourseId(any(UUID.class), eq("cs101")))
                .thenReturn(progress);

        // Act & Assert
        mockMvc.perform(get("/api/v1/quiz-progress/me/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value("cs101"));

        verify(quizProgressService, times(1)).getByUserIdAndCourseId(any(UUID.class), eq("cs101"));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("Should return 404 when quiz progress does not exist for user and course")
    void getMyCourseProgress_returns404_whenNotFound() throws Exception {
        // Arrange
        when(quizProgressService.getByUserIdAndCourseId(any(UUID.class), eq("missing")))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Quiz progress not found"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/quiz-progress/me/missing"))
                .andExpect(status().isNotFound());

        verify(quizProgressService, times(1)).getByUserIdAndCourseId(any(UUID.class), eq("missing"));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("Should return 200 with progress when progress ID exists")
    void getById_returns200_whenFound() throws Exception {
        // Arrange
        UUID progressId = UUID.randomUUID();
        QuizProgress progress = new QuizProgress();
        progress.setQuizProgressId(progressId);
        progress.setCourseId("cs101");

        when(quizProgressService.getById(eq(progressId), any(UUID.class))).thenReturn(progress);

        // Act & Assert
        mockMvc.perform(get("/api/v1/quiz-progress/{quizProgressId}", progressId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value("cs101"));

        verify(quizProgressService, times(1)).getById(eq(progressId), any(UUID.class));
    }
}
