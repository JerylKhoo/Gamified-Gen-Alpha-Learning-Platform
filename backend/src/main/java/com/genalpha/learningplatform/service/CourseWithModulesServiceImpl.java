package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.CourseWithModulesResponse;
import com.genalpha.learningplatform.model.Course;
import com.genalpha.learningplatform.repository.ModuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseWithModulesServiceImpl implements CourseWithModulesService {

    private final ModuleRepository moduleRepository;
    private final CourseService courseService;

    public CourseWithModulesServiceImpl(ModuleRepository moduleRepository,
                                        CourseService courseService) {
        this.moduleRepository = moduleRepository;
        this.courseService = courseService;
    }

    @Override
    public List<CourseWithModulesResponse> getAllCoursesWithModules() {
        return courseService.getAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CourseWithModulesResponse getCourseWithModules(String courseId) {
        Course course = courseService.getById(courseId);
        return toResponse(course);
    }

    private CourseWithModulesResponse toResponse(Course course) {
        return new CourseWithModulesResponse(
                course.getCourseId(),
                course.getDescription(),
                course.getImage(),
                moduleRepository.findByCourseIdOrderByOrderAsc(course.getCourseId())
        );
    }
}
