package com.genalpha.learningplatform.dto;

import com.genalpha.learningplatform.model.Quiz;
import lombok.Getter;
import lombok.Setter;

/**
 * Response returned by the adaptive learning endpoint containing the ability score and the next question.
 */
@Getter
@Setter
public class AdaptiveResponse {

    private double abilityScore;
    private Quiz   nextQuestion;

    public AdaptiveResponse(double abilityScore, Quiz nextQuestion) {
        this.abilityScore = abilityScore;
        this.nextQuestion = nextQuestion;
    }
}
