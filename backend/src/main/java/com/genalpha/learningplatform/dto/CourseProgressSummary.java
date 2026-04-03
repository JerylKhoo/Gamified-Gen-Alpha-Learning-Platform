package com.genalpha.learningplatform.dto;

import com.genalpha.learningplatform.model.CourseProgress;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CourseProgressSummary {
    private String courseId;
    private int completed;
    private int totalModules;
    private List<CourseProgress> completedModules;
}
