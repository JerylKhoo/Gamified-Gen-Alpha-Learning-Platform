package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Course;
import com.genalpha.learningplatform.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CourseServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
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
    void getAll_returnsCourseList() {
        when(courseRepository.findAll()).thenReturn(List.of(course));

        List<Course> result = courseService.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourseId()).isEqualTo("cs101");
    }

    @Test
    void getById_returnsCourse_whenFound() {
        when(courseRepository.findById("cs101")).thenReturn(Optional.of(course));

        Course result = courseService.getById("cs101");

        assertThat(result.getCourseId()).isEqualTo("cs101");
    }

    @Test
    void getById_throwsNotFound_whenCourseDoesNotExist() {
        when(courseRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.getById("missing"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Course not found");
    }

    @Test
    void create_savesAndReturnsCourse_whenAdminAndIdPresent() {
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(courseRepository.save(course)).thenReturn(course);

        Course result = courseService.create(course, adminId);

        assertThat(result.getCourseId()).isEqualTo("cs101");
        verify(courseRepository).save(course);
    }

    @Test
    void create_throwsForbidden_whenNotAdmin() {
        when(userService.isAdmin(adminId)).thenReturn(false);

        assertThatThrownBy(() -> courseService.create(course, adminId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Admin access required");
    }

    @Test
    void delete_deletesCourse_whenAdmin() {
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(courseRepository.findById("cs101")).thenReturn(Optional.of(course));

        courseService.delete("cs101", adminId);

        verify(courseRepository).delete(course);
    }
}
