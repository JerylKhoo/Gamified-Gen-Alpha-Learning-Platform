package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.CourseProgress;
import com.genalpha.learningplatform.repository.CourseProgressRepository;
import com.genalpha.learningplatform.util.AdminGuard;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Concrete implementation of CourseProgressService backed by JPA.
 */
@Service
public class CourseProgressServiceImpl implements CourseProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final UserService userService;

    public CourseProgressServiceImpl(CourseProgressRepository courseProgressRepository, UserService userService) {
        this.courseProgressRepository = courseProgressRepository;
        this.userService = userService;
    }

    @Override
    public List<CourseProgress> getByUserId(UUID userId) {
        return courseProgressRepository.findByUserId(userId);
    }

    @Override
    public List<CourseProgress> getByUserIdAndCourseId(UUID userId, String courseId) {
        return courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
    }

    @Override
    public CourseProgress create(CourseProgress progress, UUID requesterId) {
        progress.setCourseProgressId(null);
        progress.setUserId(requesterId);
        if (courseProgressRepository.existsByUserIdAndCourseIdAndModuleId(
                requesterId, progress.getCourseId(), progress.getModuleId())) {
            return courseProgressRepository
                    .findByUserIdAndCourseId(requesterId, progress.getCourseId())
                    .stream()
                    .filter(p -> p.getModuleId().equals(progress.getModuleId()))
                    .findFirst()
                    .orElseThrow();
        }
        return courseProgressRepository.save(progress);
    }

    @Override
    public void delete(UUID courseProgressId, UUID requesterId) {
        AdminGuard.requireAdmin(userService, requesterId);
        CourseProgress progress = courseProgressRepository.findById(courseProgressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course progress not found"));
        courseProgressRepository.delete(progress);
    }
}
