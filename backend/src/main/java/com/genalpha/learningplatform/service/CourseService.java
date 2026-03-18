package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Course;
import com.genalpha.learningplatform.repository.CourseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserService userService;

    public CourseService(CourseRepository courseRepository, UserService userService) {
        this.courseRepository = courseRepository;
        this.userService = userService;
    }

    public List<Course> getAll() {
        return courseRepository.findAll();
    }

    public Course getById(String courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    public Course create(Course course, UUID requesterId) {
        requireAdmin(requesterId);
        if (course.getCourseId() == null || course.getCourseId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course ID is required");
        }
        return courseRepository.save(course);
    }

    public Course update(String courseId, Course updates, UUID requesterId) {
        requireAdmin(requesterId);
        Course course = getById(courseId);
        if (updates.getDescription() != null) course.setDescription(updates.getDescription());
        if (updates.getImage() != null)       course.setImage(updates.getImage());
        return courseRepository.save(course);
    }

    public void delete(String courseId, UUID requesterId) {
        requireAdmin(requesterId);
        courseRepository.delete(getById(courseId));
    }

    private void requireAdmin(UUID userId) {
        if (!userService.isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
