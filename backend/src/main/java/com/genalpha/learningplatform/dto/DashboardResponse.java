package com.genalpha.learningplatform.dto;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.model.UserStreak;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardResponse {
    private User user;
    private List<CourseProgressSummary> courseProgress;
    private List<QuizProgressSummary> quizProgress;
    private List<BadgeSummary> userBadges;
    private UserStreak userStreak;
}
