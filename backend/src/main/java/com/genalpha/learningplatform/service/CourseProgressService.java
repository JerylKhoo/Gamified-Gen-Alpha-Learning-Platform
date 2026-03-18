package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.CourseProgress;
import com.genalpha.learningplatform.repository.CourseProgressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CourseProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final UserService userService;

    public CourseProgressService(CourseProgressRepository courseProgressRepository, UserService userService) {
        this.courseProgressRepository = courseProgressRepository;
        this.userService = userService;
    }

    public List<CourseProgress> getByUserId(UUID userId) {
        return courseProgressRepository.findByUserId(userId);
    }

    public List<CourseProgress> getByUserIdAndCourseId(UUID userId, String courseId) {
        return courseProgressRepository.findByUserIdAndCourseId(userId, courseId);
    }

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

    public void delete(UUID courseProgressId, UUID requesterId) {
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        CourseProgress progress = courseProgressRepository.findById(courseProgressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course progress not found"));
        courseProgressRepository.delete(progress);
    }
}
