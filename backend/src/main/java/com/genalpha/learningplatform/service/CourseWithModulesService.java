package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.CourseWithModulesResponse;

import java.util.List;

public interface CourseWithModulesService {
    List<CourseWithModulesResponse> getAllCoursesWithModules();
    CourseWithModulesResponse getCourseWithModules(String courseId);
}
