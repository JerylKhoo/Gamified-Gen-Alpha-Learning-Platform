package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ApiResponse;
import com.genalpha.learningplatform.dto.BadgeSummary;
import com.genalpha.learningplatform.dto.CourseProgressSummary;
import com.genalpha.learningplatform.dto.DashboardResponse;
import com.genalpha.learningplatform.dto.QuizProgressSummary;
import com.genalpha.learningplatform.model.CourseProgress;
import com.genalpha.learningplatform.model.QuizProgress;
import com.genalpha.learningplatform.model.UserBadge;
import com.genalpha.learningplatform.repository.BadgeRepository;
import com.genalpha.learningplatform.repository.CourseRepository;
import com.genalpha.learningplatform.repository.ModuleRepository;
import com.genalpha.learningplatform.service.*;
import com.genalpha.learningplatform.util.AuthUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Tag(name = "Dashboard", description = "Aggregated dashboard data for the authenticated user")
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final UserService userService;
    private final CourseProgressService courseProgressService;
    private final QuizProgressService quizProgressService;
    private final UserBadgeService userBadgeService;
    private final UserStreakService userStreakService;
    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final BadgeRepository badgeRepository;
    private final ObjectMapper objectMapper;

    public DashboardController(UserService userService,
                               CourseProgressService courseProgressService,
                               QuizProgressService quizProgressService,
                               UserBadgeService userBadgeService,
                               UserStreakService userStreakService,
                               ModuleRepository moduleRepository,
                               CourseRepository courseRepository,
                               BadgeRepository badgeRepository,
                               ObjectMapper objectMapper) {
        this.userService = userService;
        this.courseProgressService = courseProgressService;
        this.quizProgressService = quizProgressService;
        this.userBadgeService = userBadgeService;
        this.userStreakService = userStreakService;
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
        this.badgeRepository = badgeRepository;
        this.objectMapper = objectMapper;
    }

    @Operation(summary = "Get all dashboard data for the authenticated user")
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(Authentication authentication) {
        UUID userId = AuthUtils.userId(authentication);

        List<CourseProgress> allProgress = courseProgressService.getByUserId(userId);
        Map<String, List<CourseProgress>> byCourse = allProgress.stream()
                .collect(Collectors.groupingBy(CourseProgress::getCourseId));

        List<CourseProgressSummary> courseProgressSummaries = courseRepository.findAll().stream()
                .map(course -> {
                    List<CourseProgress> completed = byCourse.getOrDefault(course.getCourseId(), List.of());
                    return new CourseProgressSummary(
                            course.getCourseId(),
                            completed.size(),
                            moduleRepository.countByCourseId(course.getCourseId()),
                            completed
                    );
                })
                .collect(Collectors.toList());

        List<QuizProgress> allQuizProgress = quizProgressService.getByUserId(userId);
        Map<String, QuizProgress> quizByCourse = allQuizProgress.stream()
                .collect(Collectors.toMap(QuizProgress::getCourseId, qp -> qp));

        List<QuizProgressSummary> quizProgressSummaries = courseRepository.findAll().stream()
                .map(course -> {
                    QuizProgress qp = quizByCourse.get(course.getCourseId());
                    double score = 0.0;
                    if (qp != null && qp.getAdaptiveScore() != null) {
                        try {
                            com.fasterxml.jackson.databind.JsonNode node =
                                    objectMapper.readTree(qp.getAdaptiveScore());
                            if (node.has("theta")) {
                                double theta = node.get("theta").asDouble();
                                score = (theta + 3.0) / 6.0 * 100.0;
                            }
                        } catch (Exception ignored) {}
                    }
                    return new QuizProgressSummary(course.getCourseId(), score);
                })
                .collect(Collectors.toList());

        List<UserBadge> earnedBadges = userBadgeService.getMyBadges(userId);
        Map<String, UserBadge> earnedByBadgeId = earnedBadges.stream()
                .collect(Collectors.toMap(UserBadge::getBadgeId, ub -> ub));

        List<BadgeSummary> badgeSummaries = badgeRepository.findAll().stream()
                .map(badge -> {
                    UserBadge ub = earnedByBadgeId.get(badge.getBadgeId());
                    return new BadgeSummary(badge, ub != null, ub);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(new DashboardResponse(
                userService.getById(userId),
                courseProgressSummaries,
                quizProgressSummaries,
                badgeSummaries,
                userStreakService.getMyStreak(userId)
        )));
    }
}
