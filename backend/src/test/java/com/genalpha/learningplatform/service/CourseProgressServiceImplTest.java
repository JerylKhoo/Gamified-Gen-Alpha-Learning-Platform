package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.CourseProgress;
import com.genalpha.learningplatform.repository.CourseProgressRepository;
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
 * Unit tests for CourseProgressServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CourseProgressServiceImpl Unit Tests")
class CourseProgressServiceImplTest {

    @Mock
    private CourseProgressRepository courseProgressRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private CourseProgressServiceImpl courseProgressService;

    private UUID userId;
    private UUID adminId;
    private CourseProgress progress;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        adminId = UUID.randomUUID();
        progress = new CourseProgress();
        progress.setCourseProgressId(UUID.randomUUID());
        progress.setUserId(userId);
        progress.setCourseId("cs101");
        progress.setModuleId("cs101-m1");
    }

    @Test
    @DisplayName("Should return progress list when progress exists for user")
    void getByUserId_returnsProgressList() {
        // Arrange
        List<CourseProgress> expectedList = List.of(progress);
        when(courseProgressRepository.findByUserId(userId)).thenReturn(expectedList);

        // Act
        List<CourseProgress> result = courseProgressService.getByUserId(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("cs101", result.get(0).getCourseId());
        verify(courseProgressRepository, times(1)).findByUserId(userId);
    }

    @Test
    @DisplayName("Should return filtered progress list for user and course")
    void getByUserIdAndCourseId_returnsFilteredList() {
        // Arrange
        List<CourseProgress> expectedList = List.of(progress);
        when(courseProgressRepository.findByUserIdAndCourseId(userId, "cs101"))
                .thenReturn(expectedList);

        // Act
        List<CourseProgress> result = courseProgressService.getByUserIdAndCourseId(userId, "cs101");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("cs101-m1", result.get(0).getModuleId());
        verify(courseProgressRepository, times(1)).findByUserIdAndCourseId(userId, "cs101");
    }

    @Test
    @DisplayName("Should save progress when no duplicate exists")
    void create_savesProgress_whenNotDuplicate() {
        // Arrange
        when(courseProgressRepository.existsByUserIdAndCourseIdAndModuleId(
                userId, "cs101", "cs101-m1")).thenReturn(false);
        when(courseProgressRepository.save(any(CourseProgress.class))).thenReturn(progress);

        CourseProgress input = new CourseProgress();
        input.setCourseId("cs101");
        input.setModuleId("cs101-m1");

        // Act
        CourseProgress result = courseProgressService.create(input, userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        verify(courseProgressRepository, times(1)).save(any(CourseProgress.class));
    }

    @Test
    @DisplayName("Should return existing progress when duplicate already exists")
    void create_returnsExisting_whenDuplicate() {
        // Arrange
        when(courseProgressRepository.existsByUserIdAndCourseIdAndModuleId(
                userId, "cs101", "cs101-m1")).thenReturn(true);
        when(courseProgressRepository.findByUserIdAndCourseId(userId, "cs101"))
                .thenReturn(List.of(progress));

        CourseProgress input = new CourseProgress();
        input.setCourseId("cs101");
        input.setModuleId("cs101-m1");

        // Act
        CourseProgress result = courseProgressService.create(input, userId);

        // Assert
        assertNotNull(result);
        assertEquals(progress.getCourseProgressId(), result.getCourseProgressId());
        verify(courseProgressRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete progress when requester is admin")
    void delete_deletesProgress_whenAdmin() {
        // Arrange
        UUID progressId = progress.getCourseProgressId();
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(courseProgressRepository.findById(progressId)).thenReturn(Optional.of(progress));

        // Act
        courseProgressService.delete(progressId, adminId);

        // Assert
        verify(userService, times(1)).isAdmin(adminId);
        verify(courseProgressRepository, times(1)).findById(progressId);
        verify(courseProgressRepository, times(1)).delete(progress);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin")
    void delete_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(userId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> courseProgressService.delete(UUID.randomUUID(), userId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(userId);
        verify(courseProgressRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when progress does not exist")
    void delete_throwsNotFound_whenProgressMissing() {
        // Arrange
        UUID missingId = UUID.randomUUID();
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(courseProgressRepository.findById(missingId)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> courseProgressService.delete(missingId, adminId));
        assertNotNull(exception);
        verify(courseProgressRepository, times(1)).findById(missingId);
        verify(courseProgressRepository, never()).delete(any());
    }
}
