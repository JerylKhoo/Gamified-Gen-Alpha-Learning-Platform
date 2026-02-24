package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.AdaptiveRequest;
import com.genalpha.learningplatform.dto.AdaptiveResponse;
import com.genalpha.learningplatform.service.AdaptiveLearningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Adaptive Learning", description = "Calculates the next adaptive question based on answer history")
@RestController
@RequestMapping("/api/v1/adaptive")
public class AdaptiveLearningController {

    private final AdaptiveLearningService adaptiveLearningService;

    public AdaptiveLearningController(AdaptiveLearningService adaptiveLearningService) {
        this.adaptiveLearningService = adaptiveLearningService;
    }

    @Operation(
        summary = "Submit answer result and get next question",
        description = """
            Accepts the user's current adaptive score, whether their last answer was correct,
            the lesson ID, and the category.

            Score update formula (learningRate = 0.2):
              correct → newScore = value + (100 - value) × 0.2
              wrong   → newScore = value - value × 0.2

            The newScore is appended to adaptive_score in PROGRESS:
              adaptive_score: [score1, score2, ..., newScore]

            Returns the question with the lowest difficulty score strictly above
            newScore that the user has not yet answered correctly.
            Falls back to other lessons in the same category if needed.
            Returns nextQuestion: null when fully mastered.
            """
    )
    @PostMapping("/next")
    public ResponseEntity<AdaptiveResponse> getNextQuestion(
            @RequestBody AdaptiveRequest request,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        AdaptiveResponse response = adaptiveLearningService.getNextQuestion(userId, request);
        return ResponseEntity.ok(response);
    }
}
