package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Quiz;
import com.genalpha.learningplatform.repository.QuizRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for QuizServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("QuizServiceImpl Unit Tests")
class QuizServiceImplTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private QuizServiceImpl quizService;

    private UUID adminId;
    private UUID quizId;
    private Quiz quiz;

    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        quizId = UUID.randomUUID();
        quiz = new Quiz();
        quiz.setQuizId(quizId);
        quiz.setCourseId("cs101");
        quiz.setQuestion("What is 2+2?");
        quiz.setAnswer("4");
        quiz.setScore(50);
    }

    @Test
    @DisplayName("Should return quizzes for course when quizzes exist")
    void getByCourseId_returnsQuizList() {
        // Arrange
        List<Quiz> expectedQuizzes = List.of(quiz);
        when(quizRepository.findByCourseId("cs101")).thenReturn(expectedQuizzes);

        // Act
        List<Quiz> result = quizService.getByCourseId("cs101");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("What is 2+2?", result.get(0).getQuestion());
        verify(quizRepository, times(1)).findByCourseId("cs101");
    }

    @Test
    @DisplayName("Should return quiz when quiz exists")
    void getById_returnsQuiz_whenFound() {
        // Arrange
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));

        // Act
        Quiz result = quizService.getById(quizId);

        // Assert
        assertNotNull(result);
        assertEquals("cs101", result.getCourseId());
        verify(quizRepository, times(1)).findById(quizId);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when quiz does not exist")
    void getById_throwsNotFound_whenMissing() {
        // Arrange
        UUID missing = UUID.randomUUID();
        when(quizRepository.findById(missing)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizService.getById(missing));
        assertNotNull(exception);
        verify(quizRepository, times(1)).findById(missing);
    }

    @Test
    @DisplayName("Should save quiz when requester is admin")
    void create_savesQuiz_whenAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        // Act
        Quiz result = quizService.create(quiz, adminId);

        // Assert
        assertNotNull(result);
        assertEquals("4", result.getAnswer());
        verify(userService, times(1)).isAdmin(adminId);
        verify(quizRepository, times(1)).save(quiz);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin")
    void create_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizService.create(quiz, adminId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(adminId);
        verify(quizRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update quiz fields when requester is admin")
    void update_updatesFields_whenAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Quiz updates = new Quiz();
        updates.setQuestion("What is 3+3?");
        updates.setAnswer("6");
        when(quizRepository.save(quiz)).thenReturn(quiz);

        // Act
        Quiz result = quizService.update(quizId, updates, adminId);

        // Assert
        assertNotNull(result);
        assertEquals("What is 3+3?", result.getQuestion());
        assertEquals("6", result.getAnswer());
        verify(userService, times(1)).isAdmin(adminId);
        verify(quizRepository, times(1)).findById(quizId);
        verify(quizRepository, times(1)).save(quiz);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin and tries to update")
    void update_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizService.update(quizId, quiz, adminId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(adminId);
        verify(quizRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete quiz when requester is admin")
    void delete_deletesQuiz_whenAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));

        // Act
        quizService.delete(quizId, adminId);

        // Assert
        verify(userService, times(1)).isAdmin(adminId);
        verify(quizRepository, times(1)).findById(quizId);
        verify(quizRepository, times(1)).delete(quiz);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin and tries to delete")
    void delete_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizService.delete(quizId, adminId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(adminId);
        verify(quizRepository, never()).delete(any());
    }
}
