package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.QuizProgress;
import com.genalpha.learningplatform.repository.QuizProgressRepository;
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
 * Unit tests for QuizProgressServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("QuizProgressServiceImpl Unit Tests")
class QuizProgressServiceImplTest {

    @Mock
    private QuizProgressRepository quizProgressRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private QuizProgressServiceImpl quizProgressService;

    private UUID userId;
    private UUID adminId;
    private QuizProgress progress;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        adminId = UUID.randomUUID();
        progress = new QuizProgress();
        progress.setQuizProgressId(UUID.randomUUID());
        progress.setUserId(userId);
        progress.setCourseId("cs101");
        progress.setAdaptiveScore("{}");
        progress.setCorrectQuestions("[]");
        progress.setWrongQuestions("[]");
        progress.setAdaptiveHistory("[]");
    }

    @Test
    @DisplayName("Should return progress list when progress exists for user")
    void getByUserId_returnsProgressList() {
        // Arrange
        List<QuizProgress> expectedList = List.of(progress);
        when(quizProgressRepository.findByUserId(userId)).thenReturn(expectedList);

        // Act
        List<QuizProgress> result = quizProgressService.getByUserId(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("cs101", result.get(0).getCourseId());
        verify(quizProgressRepository, times(1)).findByUserId(userId);
    }

    @Test
    @DisplayName("Should return progress when progress exists for user and course")
    void getByUserIdAndCourseId_returnsProgress_whenFound() {
        // Arrange
        when(quizProgressRepository.findByUserIdAndCourseId(userId, "cs101"))
                .thenReturn(Optional.of(progress));

        // Act
        QuizProgress result = quizProgressService.getByUserIdAndCourseId(userId, "cs101");

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        verify(quizProgressRepository, times(1)).findByUserIdAndCourseId(userId, "cs101");
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when quiz progress does not exist for user and course")
    void getByUserIdAndCourseId_throwsNotFound_whenMissing() {
        // Arrange
        when(quizProgressRepository.findByUserIdAndCourseId(userId, "missing"))
                .thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizProgressService.getByUserIdAndCourseId(userId, "missing"));
        assertNotNull(exception);
        verify(quizProgressRepository, times(1)).findByUserIdAndCourseId(userId, "missing");
    }

    @Test
    @DisplayName("Should return progress when requester is the owner")
    void getById_returnsProgress_whenOwner() {
        // Arrange
        UUID progressId = progress.getQuizProgressId();
        when(quizProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        // Act
        QuizProgress result = quizProgressService.getById(progressId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        verify(quizProgressRepository, times(1)).findById(progressId);
    }

    @Test
    @DisplayName("Should return progress when requester is admin")
    void getById_returnsProgress_whenAdmin() {
        // Arrange
        UUID progressId = progress.getQuizProgressId();
        when(quizProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        when(userService.isAdmin(adminId)).thenReturn(true);

        // Act
        QuizProgress result = quizProgressService.getById(progressId, adminId);

        // Assert
        assertNotNull(result);
        assertEquals("cs101", result.getCourseId());
        verify(quizProgressRepository, times(1)).findById(progressId);
        verify(userService, times(1)).isAdmin(adminId);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is neither owner nor admin")
    void getById_throwsForbidden_whenNeitherOwnerNorAdmin() {
        // Arrange
        UUID otherId = UUID.randomUUID();
        UUID progressId = progress.getQuizProgressId();
        when(quizProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        when(userService.isAdmin(otherId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizProgressService.getById(progressId, otherId));
        assertNotNull(exception);
        verify(quizProgressRepository, times(1)).findById(progressId);
        verify(userService, times(1)).isAdmin(otherId);
    }

    @Test
    @DisplayName("Should set defaults and save when creating quiz progress")
    void create_setsDefaultsAndSaves() {
        // Arrange
        QuizProgress input = new QuizProgress();
        input.setCourseId("cs101");
        when(quizProgressRepository.save(any(QuizProgress.class))).thenReturn(progress);

        // Act
        QuizProgress result = quizProgressService.create(input, userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, input.getUserId());
        assertEquals("{}", input.getAdaptiveScore());
        assertEquals("[]", input.getCorrectQuestions());
        assertEquals("[]", input.getWrongQuestions());
        assertEquals("[]", input.getAdaptiveHistory());
        verify(quizProgressRepository, times(1)).save(any(QuizProgress.class));
    }

    @Test
    @DisplayName("Should update progress fields when requester is the owner")
    void update_updatesFields_whenOwner() {
        // Arrange
        UUID progressId = progress.getQuizProgressId();
        when(quizProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        QuizProgress updates = new QuizProgress();
        updates.setAdaptiveScore("{\"theta\":1.0}");
        when(quizProgressRepository.save(progress)).thenReturn(progress);

        // Act
        QuizProgress result = quizProgressService.update(progressId, updates, userId);

        // Assert
        assertNotNull(result);
        assertEquals("{\"theta\":1.0}", result.getAdaptiveScore());
        verify(quizProgressRepository, times(1)).findById(progressId);
        verify(quizProgressRepository, times(1)).save(progress);
    }

    @Test
    @DisplayName("Should delete progress when requester is admin")
    void delete_deletesProgress_whenAdmin() {
        // Arrange
        UUID progressId = progress.getQuizProgressId();
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(quizProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        // Act
        quizProgressService.delete(progressId, adminId);

        // Assert
        verify(userService, times(1)).isAdmin(adminId);
        verify(quizProgressRepository, times(1)).findById(progressId);
        verify(quizProgressRepository, times(1)).delete(progress);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin")
    void delete_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(userId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizProgressService.delete(UUID.randomUUID(), userId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(userId);
        verify(quizProgressRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when quiz progress does not exist")
    void delete_throwsNotFound_whenProgressMissing() {
        // Arrange
        UUID missingId = UUID.randomUUID();
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(quizProgressRepository.findById(missingId)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizProgressService.delete(missingId, adminId));
        assertNotNull(exception);
        verify(quizProgressRepository, times(1)).findById(missingId);
        verify(quizProgressRepository, never()).delete(any());
    }
}
