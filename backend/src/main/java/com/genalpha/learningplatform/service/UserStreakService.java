package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.UserStreak;
import com.genalpha.learningplatform.repository.UserStreakRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class UserStreakService {

    private final UserStreakRepository userStreakRepository;

    public UserStreakService(UserStreakRepository userStreakRepository) {
        this.userStreakRepository = userStreakRepository;
    }

    public UserStreak getMyStreak(UUID userId) {
        return userStreakRepository.findByUserId(userId)
                .orElseGet(() -> createStreak(userId));
    }

    /**
     * Records activity for today. Applies the same rules as the DB trigger:
     * - If last_activity_date is today → no change (already counted).
     * - If gap > 2 days → reset current_streak to 1.
     * - Otherwise → increment current_streak by 1.
     * - Promotes longest_streak if current_streak exceeds it.
     */
    @Transactional
    public UserStreak recordActivity(UUID userId) {
        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElseGet(() -> createStreak(userId));

        LocalDate today = LocalDate.now();
        LocalDate last  = streak.getLastActivityDate();

        if (last != null && last.isEqual(today)) {
            return streak; // already recorded today
        }

        if (last == null || today.toEpochDay() - last.toEpochDay() > 2) {
            streak.setCurrentStreak(1);
        } else {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        }

        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }

        streak.setLastActivityDate(today);
        return userStreakRepository.save(streak);
    }

    private UserStreak createStreak(UUID userId) {
        UserStreak s = new UserStreak();
        s.setUserId(userId);
        s.setCurrentStreak(0);
        s.setLongestStreak(0);
        return userStreakRepository.save(s);
    }

    public UserStreak getById(UUID streakId, UUID requesterId) {
        UserStreak streak = userStreakRepository.findById(streakId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Streak not found"));
        if (!streak.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return streak;
    }

    public void delete(UUID streakId, UUID requesterId) {
        UserStreak streak = getById(streakId, requesterId);
        userStreakRepository.delete(streak);
    }
}
