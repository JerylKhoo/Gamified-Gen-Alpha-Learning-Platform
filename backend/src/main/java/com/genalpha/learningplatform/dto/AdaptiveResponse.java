package com.genalpha.learningplatform.dto;

import com.genalpha.learningplatform.model.Quiz;

public class AdaptiveResponse {

    private double abilityScore;  // user's current calculated ability (0–100)
    private Quiz   nextQuestion;  // null if no harder question exists (course mastered)

    public AdaptiveResponse(double abilityScore, Quiz nextQuestion) {
        this.abilityScore = abilityScore;
        this.nextQuestion = nextQuestion;
    }

    public double getAbilityScore() { return abilityScore; }
    public Quiz getNextQuestion() { return nextQuestion; }
}
