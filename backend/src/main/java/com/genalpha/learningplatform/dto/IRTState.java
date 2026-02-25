package com.genalpha.learningplatform.dto;

import java.util.HashMap;
import java.util.Map;

/**
 * Stored in PROGRESS.adaptive_score (JSONB).
 *
 * theta  – IRT ability estimate, normalised to [-3, 3]
 *          (maps to a 0–100 display score via thetaToScore())
 * items  – SM-2 spaced-repetition state per question UUID
 */
public class IRTState {

    private double theta = 0.0;                  // starts at midpoint (score ≈ 50)
    private Map<String, SRItem> items = new HashMap<>();

    // ── Getters / Setters ─────────────────────────────────────────────────────
    public double getTheta() { return theta; }
    public void setTheta(double theta) { this.theta = theta; }
    public Map<String, SRItem> getItems() { return items; }
    public void setItems(Map<String, SRItem> items) { this.items = items; }

    // ── SM-2 item state ───────────────────────────────────────────────────────
    public static class SRItem {
        private int    interval = 1;          // days until next review
        private double ef       = 2.5;        // ease factor (≥ 1.3)
        private int    reps     = 0;          // consecutive correct answers
        private long   due      = 0L;         // epoch-millis of next review (0 = due now)

        public int    getInterval() { return interval; }
        public void   setInterval(int interval) { this.interval = interval; }
        public double getEf()       { return ef; }
        public void   setEf(double ef) { this.ef = ef; }
        public int    getReps()     { return reps; }
        public void   setReps(int reps) { this.reps = reps; }
        public long   getDue()      { return due; }
        public void   setDue(long due) { this.due = due; }
    }
}
