package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Progress;
import com.genalpha.learningplatform.repository.ProgressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;

    public ProgressService(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public List<Progress> getByUser(UUID userId) {
        return progressRepository.findByUserId(userId);
    }

    public Progress getById(UUID progressId, UUID requesterId) {
        Progress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
        if (!progress.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return progress;
    }

    public Progress getByLesson(UUID userId, String lessonId) {
        return progressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
    }

    public Progress create(Progress progress, UUID requesterId) {
        progress.setProgressId(null);
        progress.setUserId(requesterId);
        return progressRepository.save(progress);
    }

    public Progress update(UUID progressId, Progress updates, UUID requesterId) {
        Progress progress = getById(progressId, requesterId);
        if (updates.getAdaptiveScore() != null) progress.setAdaptiveScore(updates.getAdaptiveScore());
        if (updates.getCorrectQuestions() != null) progress.setCorrectQuestions(updates.getCorrectQuestions());
        if (updates.getWrongQuestions() != null) progress.setWrongQuestions(updates.getWrongQuestions());
        return progressRepository.save(progress);
    }

    public void delete(UUID progressId, UUID requesterId) {
        Progress progress = getById(progressId, requesterId);
        progressRepository.delete(progress);
    }
}
