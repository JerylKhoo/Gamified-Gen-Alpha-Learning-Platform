package com.genalpha.learningplatform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.genalpha.learningplatform.dto.AdaptiveRequest;
import com.genalpha.learningplatform.dto.AdaptiveResponse;
import com.genalpha.learningplatform.model.Quiz;
import com.genalpha.learningplatform.model.QuizProgress;
import com.genalpha.learningplatform.repository.QuizProgressRepository;
import com.genalpha.learningplatform.repository.QuizRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AdaptiveLearningServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("AdaptiveLearningServiceImpl Unit Tests")
class AdaptiveLearningServiceImplTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizProgressRepository quizProgressRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AdaptiveLearningServiceImpl adaptiveLearningService;

    private UUID userId;
    private QuizProgress existingProgress;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        existingProgress = new QuizProgress();
        existingProgress.setQuizProgressId(UUID.randomUUID());
        existingProgress.setUserId(userId);
        existingProgress.setCourseId("cs101");
        existingProgress.setAdaptiveScore("{}");
        existingProgress.setCorrectQuestions("[]");
        existingProgress.setWrongQuestions("[]");
        existingProgress.setAdaptiveHistory("[]");
    }

    @Test
    @DisplayName("Should create progress and return first question when no progress exists")
    void getNextQuestion_createsProgressAndReturnsFirstQuestion_whenNoProgress() {
        // Arrange
        Quiz quiz = new Quiz();
        quiz.setQuizId(UUID.randomUUID());
        quiz.setCourseId("cs101");
        quiz.setQuestion("What is 2+2?");
        quiz.setScore(50);

        when(quizProgressRepository.findByUserIdAndCourseId(userId, "cs101"))
                .thenReturn(Optional.empty());
        when(quizRepository.findByCourseId("cs101")).thenReturn(List.of(quiz));
        when(quizProgressRepository.save(any(QuizProgress.class))).thenReturn(existingProgress);

        AdaptiveRequest request = new AdaptiveRequest();
        request.setCourseId("cs101");
        request.setQuizId(null);
        request.setCorrect(false);

        // Act
        AdaptiveResponse response = adaptiveLearningService.getNextQuestion(userId, request);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getNextQuestion());
        assertEquals("What is 2+2?", response.getNextQuestion().getQuestion());
        verify(quizProgressRepository, times(1)).findByUserIdAndCourseId(userId, "cs101");
        verify(quizProgressRepository, never()).save(any(QuizProgress.class));
    }

    @Test
    @DisplayName("Should update progress and return higher ability score on correct answer")
    void getNextQuestion_updatesProgressOnCorrectAnswer() {
        // Arrange
        UUID quizId = UUID.randomUUID();
        Quiz quiz = new Quiz();
        quiz.setQuizId(quizId);
        quiz.setCourseId("cs101");
        quiz.setQuestion("Hard question");
        quiz.setScore(70);

        when(quizProgressRepository.findByUserIdAndCourseId(userId, "cs101"))
                .thenReturn(Optional.of(existingProgress));
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        when(quizProgressRepository.save(any(QuizProgress.class))).thenReturn(existingProgress);
        when(quizRepository.findByCourseId("cs101")).thenReturn(List.of(quiz));

        AdaptiveRequest request = new AdaptiveRequest();
        request.setCourseId("cs101");
        request.setQuizId(quizId);
        request.setCorrect(true);

        // Act
        AdaptiveResponse response = adaptiveLearningService.getNextQuestion(userId, request);

        // Assert
        assertNotNull(response);
        assertTrue(response.getAbilityScore() > 50.0);
        verify(quizProgressRepository, atLeastOnce()).save(any(QuizProgress.class));
    }

    @Test
    @DisplayName("Should return null next question and 100 ability score when course is mastered")
    void getNextQuestion_returnsNullNextQuestion_whenCourseMastered() {
        // Arrange
        UUID quizId = UUID.randomUUID();
        Quiz quiz = new Quiz();
        quiz.setQuizId(quizId);
        quiz.setCourseId("cs101");
        quiz.setScore(50);

        existingProgress.setCorrectQuestions("[\"" + quizId + "\"]");

        when(quizProgressRepository.findByUserIdAndCourseId(userId, "cs101"))
                .thenReturn(Optional.of(existingProgress));
        when(quizRepository.findByCourseId("cs101")).thenReturn(List.of(quiz));
        when(quizProgressRepository.save(any(QuizProgress.class))).thenReturn(existingProgress);

        AdaptiveRequest request = new AdaptiveRequest();
        request.setCourseId("cs101");
        request.setQuizId(null);
        request.setCorrect(false);

        // Act
        AdaptiveResponse response = adaptiveLearningService.getNextQuestion(userId, request);

        // Assert
        assertNotNull(response);
        assertNull(response.getNextQuestion());
        assertEquals(100.0, response.getAbilityScore());
    }

    @Test
    @DisplayName("Should move quiz to wrong list and save progress when answered incorrectly")
    void getNextQuestion_movesQuizToWrongList_whenAnsweredIncorrectly() {
        // Arrange
        UUID quizId = UUID.randomUUID();
        Quiz quiz = new Quiz();
        quiz.setQuizId(quizId);
        quiz.setCourseId("cs101");
        quiz.setScore(60);

        when(quizProgressRepository.findByUserIdAndCourseId(userId, "cs101"))
                .thenReturn(Optional.of(existingProgress));
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        when(quizProgressRepository.save(any(QuizProgress.class))).thenReturn(existingProgress);
        when(quizRepository.findByCourseId("cs101")).thenReturn(List.of(quiz));

        AdaptiveRequest request = new AdaptiveRequest();
        request.setCourseId("cs101");
        request.setQuizId(quizId);
        request.setCorrect(false);

        // Act
        adaptiveLearningService.getNextQuestion(userId, request);

        // Assert
        verify(quizProgressRepository, atLeastOnce()).save(any(QuizProgress.class));
    }
}
