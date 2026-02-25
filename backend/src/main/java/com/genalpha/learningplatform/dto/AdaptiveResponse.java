package com.genalpha.learningplatform.dto;

import com.genalpha.learningplatform.model.Question;

public class AdaptiveResponse {

    private double abilityScore;   // user's current calculated ability (0–100)
    private Question nextQuestion; // null if no harder question exists

    public AdaptiveResponse(double abilityScore, Question nextQuestion) {
        this.abilityScore = abilityScore;
        this.nextQuestion = nextQuestion;
    }

    public double getAbilityScore() { return abilityScore; }
    public Question getNextQuestion() { return nextQuestion; }
}
