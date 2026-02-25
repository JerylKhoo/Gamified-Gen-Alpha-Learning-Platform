package com.genalpha.learningplatform.dto;

import java.util.HashMap;
import java.util.Map;

/**
 * Stored in PROGRESS.adaptive_score (JSONB).
 *
 * theta         – IRT ability estimate, normalised to [-3, 3]
 *                 (maps to a 0–100 display score via thetaToScore())
 * questionCount – total questions answered in this lesson (used as SR clock)
 * items         – SM-2 spaced-repetition state per question UUID
 *
 * SR intervals are measured in QUESTIONS ANSWERED, not calendar days.
 * e.g. interval=6 means "show again after 6 more questions have been answered".
 * This means a student who completes the whole module in one sitting still
 * benefits from spaced repetition within that session.
 */
public class IRTState {

    private double theta = -3.0;                 // starts at minimum → abilityScore = 0 → easiest question first
    private int    questionCount = 0;            // questions answered so far (SR clock)
    private Map<String, SRItem> items = new HashMap<>();

    // ── Getters / Setters ─────────────────────────────────────────────────────
    public double getTheta() { return theta; }
    public void setTheta(double theta) { this.theta = theta; }
    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
    public Map<String, SRItem> getItems() { return items; }
    public void setItems(Map<String, SRItem> items) { this.items = items; }

    // ── SM-2 item state ───────────────────────────────────────────────────────
    public static class SRItem {
        private int    interval = 1;   // questions until next review (not days)
        private double ef       = 2.5; // ease factor (≥ 1.3)
        private int    reps     = 0;   // consecutive correct answers
        private int    due      = 0;   // questionCount threshold when this becomes reviewable (0 = due now)

        public int    getInterval() { return interval; }
        public void   setInterval(int interval) { this.interval = interval; }
        public double getEf()       { return ef; }
        public void   setEf(double ef) { this.ef = ef; }
        public int    getReps()     { return reps; }
        public void   setReps(int reps) { this.reps = reps; }
        public int    getDue()      { return due; }
        public void   setDue(int due) { this.due = due; }
    }
}
