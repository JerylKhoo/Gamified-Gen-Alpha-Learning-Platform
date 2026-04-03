package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Course;
import com.genalpha.learningplatform.repository.CourseRepository;
import com.genalpha.learningplatform.util.AdminGuard;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Concrete implementation of CourseService backed by JPA.
 */
@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserService userService;

    public CourseServiceImpl(CourseRepository courseRepository, UserService userService) {
        this.courseRepository = courseRepository;
        this.userService = userService;
    }

    @Override
    public List<Course> getAll() {
        return courseRepository.findAll();
    }

    @Override
    public Course getById(String courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    @Override
    public Course create(Course course, UUID requesterId) {
        AdminGuard.requireAdmin(userService, requesterId);
        if (course.getCourseId() == null || course.getCourseId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course ID is required");
        }
        return courseRepository.save(course);
    }

    @Override
    public Course update(String courseId, Course updates, UUID requesterId) {
        AdminGuard.requireAdmin(userService, requesterId);
        Course course = getById(courseId);
        if (updates.getDescription() != null) course.setDescription(updates.getDescription());
        if (updates.getImage() != null)       course.setImage(updates.getImage());
        return courseRepository.save(course);
    }

    @Override
    public void delete(String courseId, UUID requesterId) {
        AdminGuard.requireAdmin(userService, requesterId);
        courseRepository.delete(getById(courseId));
    }
}
