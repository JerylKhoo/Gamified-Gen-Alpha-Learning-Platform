package com.genalpha.learningplatform.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * Request body for the adaptive learning endpoint, carrying context about the last answered question.
 */
@Getter
@Setter
public class AdaptiveRequest {

    private String courseId;
    private UUID   quizId;
    private boolean correct;
}
