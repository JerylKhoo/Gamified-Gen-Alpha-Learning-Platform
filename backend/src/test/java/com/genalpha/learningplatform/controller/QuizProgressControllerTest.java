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
 * Black-box controller tests for QuizProgressController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(QuizProgressController.class)
@DisplayName("QuizProgressController Black-Box Tests")
class QuizProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuizProgressService quizProgressService;

    // ── GET /api/v1/quiz-progress/me ─────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /quiz-progress/me → 200 with ApiResponse envelope containing progress list")
    void getMyProgress_returns200WithEnvelopedProgressList() throws Exception {
        QuizProgress progress = new QuizProgress();
        progress.setQuizProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");
        progress.setAdaptiveScore("{}");

        when(quizProgressService.getByUserId(any(UUID.class))).thenReturn(List.of(progress));

        mockMvc.perform(get("/api/v1/quiz-progress/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].courseId").value("cs101"));

        verify(quizProgressService, times(1)).getByUserId(any(UUID.class));
    }

    // ── GET /api/v1/quiz-progress/me/{courseId} ───────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /quiz-progress/me/{courseId} → 200 with ApiResponse envelope when progress found")
    void getMyCourseProgress_returns200WithEnvelopedProgress() throws Exception {
        QuizProgress progress = new QuizProgress();
        progress.setQuizProgressId(UUID.randomUUID());
        progress.setCourseId("cs101");

        when(quizProgressService.getByUserIdAndCourseId(any(UUID.class), eq("cs101")))
                .thenReturn(progress);

        mockMvc.perform(get("/api/v1/quiz-progress/me/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.courseId").value("cs101"));

        verify(quizProgressService, times(1)).getByUserIdAndCourseId(any(UUID.class), eq("cs101"));
    }

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /quiz-progress/me/{courseId} → 404 when no progress for that course")
    void getMyCourseProgress_returns404_whenNotFound() throws Exception {
        when(quizProgressService.getByUserIdAndCourseId(any(UUID.class), eq("missing")))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Quiz progress not found"));

        mockMvc.perform(get("/api/v1/quiz-progress/me/missing"))
                .andExpect(status().isNotFound());

        verify(quizProgressService, times(1)).getByUserIdAndCourseId(any(UUID.class), eq("missing"));
    }

    // ── GET /api/v1/quiz-progress/{quizProgressId} ───────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("GET /quiz-progress/{quizProgressId} → 200 with ApiResponse envelope when found")
    void getById_returns200WithEnvelopedProgress() throws Exception {
        UUID progressId = UUID.randomUUID();
        QuizProgress progress = new QuizProgress();
        progress.setQuizProgressId(progressId);
        progress.setCourseId("cs101");

        when(quizProgressService.getById(eq(progressId), any(UUID.class))).thenReturn(progress);

        mockMvc.perform(get("/api/v1/quiz-progress/{quizProgressId}", progressId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.courseId").value("cs101"));

        verify(quizProgressService, times(1)).getById(eq(progressId), any(UUID.class));
    }
}
