package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.model.Quiz;
import com.genalpha.learningplatform.service.QuizService;
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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Black-box controller tests for QuizController.
 * Tests HTTP inputs and outputs only; service internals are mocked.
 */
@WebMvcTest(QuizController.class)
@DisplayName("QuizController Black-Box Tests")
class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuizService quizService;

    // ── GET /api/v1/quizzes/course/{courseId} ─────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /quizzes/course/{courseId} → 200 with ApiResponse envelope containing quiz list")
    void getByCourseId_returns200WithEnvelopedQuizList() throws Exception {
        Quiz quiz = new Quiz();
        quiz.setQuizId(UUID.randomUUID());
        quiz.setCourseId("cs101");
        quiz.setQuestion("What is 2+2?");
        quiz.setScore(50);

        when(quizService.getByCourseId("cs101")).thenReturn(List.of(quiz));

        mockMvc.perform(get("/api/v1/quizzes/course/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].question").value("What is 2+2?"));

        verify(quizService, times(1)).getByCourseId("cs101");
    }

    // ── GET /api/v1/quizzes/{quizId} ─────────────────────────────────────────

    @Test
    @WithMockUser
    @DisplayName("GET /quizzes/{quizId} → 200 with ApiResponse envelope when quiz exists")
    void getById_returns200WithEnvelopedQuiz() throws Exception {
        UUID quizId = UUID.randomUUID();
        Quiz quiz = new Quiz();
        quiz.setQuizId(quizId);
        quiz.setCourseId("cs101");
        quiz.setQuestion("Hard question");

        when(quizService.getById(quizId)).thenReturn(quiz);

        mockMvc.perform(get("/api/v1/quizzes/{quizId}", quizId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.courseId").value("cs101"));

        verify(quizService, times(1)).getById(quizId);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /quizzes/{quizId} → 404 when quiz does not exist")
    void getById_returns404_whenQuizNotFound() throws Exception {
        UUID quizId = UUID.randomUUID();
        when(quizService.getById(quizId))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Quiz not found"));

        mockMvc.perform(get("/api/v1/quizzes/{quizId}", quizId))
                .andExpect(status().isNotFound());

        verify(quizService, times(1)).getById(quizId);
    }

    // ── POST /api/v1/quizzes ──────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("POST /quizzes → 201 with created quiz")
    void create_returns201WithCreatedQuiz() throws Exception {
        UUID quizId = UUID.randomUUID();
        Quiz quiz = new Quiz();
        quiz.setQuizId(quizId);
        quiz.setCourseId("cs101");
        quiz.setQuestion("New question?");

        when(quizService.create(any(Quiz.class), any())).thenReturn(quiz);

        mockMvc.perform(post("/api/v1/quizzes").with(csrf())
                        .contentType("application/json")
                        .content("{\"courseId\":\"cs101\",\"question\":\"New question?\",\"score\":50}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.question").value("New question?"));

        verify(quizService, times(1)).create(any(Quiz.class), any());
    }

    // ── DELETE /api/v1/quizzes/{quizId} ──────────────────────────────────────

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000001")
    @DisplayName("DELETE /quizzes/{quizId} → 204 when quiz deleted successfully")
    void delete_returns204_whenDeleted() throws Exception {
        UUID quizId = UUID.randomUUID();
        doNothing().when(quizService).delete(eq(quizId), any());

        mockMvc.perform(delete("/api/v1/quizzes/{quizId}", quizId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(quizService, times(1)).delete(eq(quizId), any());
    }
}
