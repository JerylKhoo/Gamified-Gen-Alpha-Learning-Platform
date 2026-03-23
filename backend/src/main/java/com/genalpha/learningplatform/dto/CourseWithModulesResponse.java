package com.genalpha.learningplatform.dto;

import com.genalpha.learningplatform.model.Module;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CourseWithModulesResponse {
    private String courseId;
    private String description;
    private String image;
    private List<Module> modules;
}
