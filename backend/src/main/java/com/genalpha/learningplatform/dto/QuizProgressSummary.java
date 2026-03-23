package com.genalpha.learningplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizProgressSummary {
    private String courseId;
    private double adaptiveScore; // 0-100 display score derived from IRT theta
}
