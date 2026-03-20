package com.genalpha.learningplatform.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.HashMap;
import java.util.Map;

/**
 * Stored in PROGRESS.adaptive_score (JSONB).
 *
 * theta         IRT ability estimate, normalised to [-3, 3]
 *                 (maps to a 0-100 display score via thetaToScore())
 * questionCount total questions answered in this lesson (used as SR clock)
 * items         SM-2 spaced-repetition state per question UUID
 *
 * SR intervals are measured in QUESTIONS ANSWERED, not calendar days.
 * e.g. interval=6 means "show again after 6 more questions have been answered".
 * This means a student who completes the whole module in one sitting still
 * benefits from spaced repetition within that session.
 */
@Getter
@Setter
public class IRTState {

    private double theta = -3.0;
    private int    questionCount = 0;
    private Map<String, SRItem> items = new HashMap<>();

    public static class SRItem {
        private int    interval = 1;
        private double ef       = 2.5;
        private int    reps     = 0;
        private int    due      = 0;

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
