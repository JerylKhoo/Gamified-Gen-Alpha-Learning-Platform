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

import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for QuizController using MockMvc.
 */
@WebMvcTest(QuizController.class)
@DisplayName("QuizController Unit Tests")
class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuizService quizService;

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with quiz list when quizzes exist for course")
    void getByCourseId_returns200WithQuizList() throws Exception {
        // Arrange
        Quiz quiz = new Quiz();
        quiz.setQuizId(UUID.randomUUID());
        quiz.setCourseId("cs101");
        quiz.setQuestion("What is 2+2?");
        quiz.setScore(50);

        when(quizService.getByCourseId("cs101")).thenReturn(List.of(quiz));

        // Act & Assert
        mockMvc.perform(get("/api/v1/quizzes/course/cs101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].question").value("What is 2+2?"));

        verify(quizService, times(1)).getByCourseId("cs101");
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 200 with quiz when quiz exists")
    void getById_returns200_whenQuizExists() throws Exception {
        // Arrange
        UUID quizId = UUID.randomUUID();
        Quiz quiz = new Quiz();
        quiz.setQuizId(quizId);
        quiz.setCourseId("cs101");
        quiz.setQuestion("Hard question");

        when(quizService.getById(quizId)).thenReturn(quiz);

        // Act & Assert
        mockMvc.perform(get("/api/v1/quizzes/{quizId}", quizId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value("cs101"));

        verify(quizService, times(1)).getById(quizId);
    }

    @Test
    @WithMockUser
    @DisplayName("Should return 404 when quiz does not exist")
    void getById_returns404_whenQuizNotFound() throws Exception {
        // Arrange
        UUID quizId = UUID.randomUUID();
        when(quizService.getById(quizId))
                .thenThrow(new ResponseStatusException(NOT_FOUND, "Quiz not found"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/quizzes/{quizId}", quizId))
                .andExpect(status().isNotFound());

        verify(quizService, times(1)).getById(quizId);
    }
}
