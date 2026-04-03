package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.AdaptiveRequest;
import com.genalpha.learningplatform.dto.AdaptiveResponse;
import com.genalpha.learningplatform.service.AdaptiveLearningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.genalpha.learningplatform.util.AuthUtils;

import java.util.UUID;

@Tag(name = "Adaptive Learning", description = "Calculates the next adaptive quiz question based on answer history")
@RestController
@RequestMapping("/api/v1/adaptive")
public class AdaptiveLearningController {

    private final AdaptiveLearningService adaptiveLearningService;

    public AdaptiveLearningController(AdaptiveLearningService adaptiveLearningService) {
        this.adaptiveLearningService = adaptiveLearningService;
    }

    @Operation(
        summary = "Submit answer result and get next quiz question",
        description = """
            Accepts the course ID and whether the last answer was correct.

            Uses IRT (1PL Rasch) + SM-2 Spaced Repetition to update the user's
            ability estimate (theta) and select the optimal next quiz question.

            Returns nextQuestion: null when the course is fully mastered.
            """
    )
    @PostMapping("/next")
    public ResponseEntity<AdaptiveResponse> getNextQuestion(
            @RequestBody AdaptiveRequest request,
            Authentication authentication) {

        UUID userId = AuthUtils.userId(authentication);
        AdaptiveResponse response = adaptiveLearningService.getNextQuestion(userId, request);
        return ResponseEntity.ok(response);
    }
}
