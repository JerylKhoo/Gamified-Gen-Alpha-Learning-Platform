package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Course;
import com.genalpha.learningplatform.repository.CourseRepository;
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
import static org.mockito.Mockito.*;

/**
 * Unit tests for CourseServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CourseServiceImpl Unit Tests")
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private CourseServiceImpl courseService;

    private UUID adminId;
    private Course course;

    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        course = new Course();
        course.setCourseId("cs101");
        course.setDescription("Intro to CS");
    }

    @Test
    @DisplayName("Should return all courses when courses exist")
    void getAll_returnsCourseList() {
        // Arrange
        List<Course> expectedCourses = List.of(course);
        when(courseRepository.findAll()).thenReturn(expectedCourses);

        // Act
        List<Course> result = courseService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("cs101", result.get(0).getCourseId());
        verify(courseRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return course when course exists")
    void getById_returnsCourse_whenFound() {
        // Arrange
        when(courseRepository.findById("cs101")).thenReturn(Optional.of(course));

        // Act
        Course result = courseService.getById("cs101");

        // Assert
        assertNotNull(result);
        assertEquals("cs101", result.getCourseId());
        verify(courseRepository, times(1)).findById("cs101");
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when course does not exist")
    void getById_throwsNotFound_whenCourseDoesNotExist() {
        // Arrange
        when(courseRepository.findById("missing")).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> courseService.getById("missing"));
        assertNotNull(exception);
        verify(courseRepository, times(1)).findById("missing");
    }

    @Test
    @DisplayName("Should save and return course when requester is admin and course ID is present")
    void create_savesAndReturnsCourse_whenAdminAndIdPresent() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(courseRepository.save(course)).thenReturn(course);

        // Act
        Course result = courseService.create(course, adminId);

        // Assert
        assertNotNull(result);
        assertEquals("cs101", result.getCourseId());
        verify(userService, times(1)).isAdmin(adminId);
        verify(courseRepository, times(1)).save(course);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin")
    void create_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> courseService.create(course, adminId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(adminId);
        verify(courseRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete course when requester is admin")
    void delete_deletesCourse_whenAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(courseRepository.findById("cs101")).thenReturn(Optional.of(course));

        // Act
        courseService.delete("cs101", adminId);

        // Assert
        verify(userService, times(1)).isAdmin(adminId);
        verify(courseRepository, times(1)).findById("cs101");
        verify(courseRepository, times(1)).delete(course);
    }
}
