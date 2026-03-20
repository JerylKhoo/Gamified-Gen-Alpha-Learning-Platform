package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.AdaptiveRequest;
import com.genalpha.learningplatform.dto.AdaptiveResponse;
import java.util.UUID;

/**
 * Defines the adaptive learning operation that selects the next quiz question using IRT and SM-2 spaced repetition.
 */
public interface AdaptiveLearningService {
    AdaptiveResponse getNextQuestion(UUID userId, AdaptiveRequest request);
}
