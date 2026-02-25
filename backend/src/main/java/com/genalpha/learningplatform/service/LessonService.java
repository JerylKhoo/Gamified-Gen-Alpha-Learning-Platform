package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Lesson;
import com.genalpha.learningplatform.repository.LessonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final UserService userService;

    public LessonService(LessonRepository lessonRepository, UserService userService) {
        this.lessonRepository = lessonRepository;
        this.userService = userService;
    }

    public List<Lesson> getAll() {
        return lessonRepository.findAll();
    }

    public List<Lesson> getByCategory(String category) {
        return lessonRepository.findByCategory(category);
    }

    public Lesson getById(String lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
    }

    public Lesson create(Lesson lesson, UUID requesterId) {
        requireAdmin(requesterId);
        return lessonRepository.save(lesson);
    }

    public Lesson update(String lessonId, Lesson updates, UUID requesterId) {
        requireAdmin(requesterId);
        Lesson lesson = getById(lessonId);
        if (updates.getCategory() != null)    lesson.setCategory(updates.getCategory());
        if (updates.getDescription() != null) lesson.setDescription(updates.getDescription());
        if (updates.getImage() != null)       lesson.setImage(updates.getImage());
        return lessonRepository.save(lesson);
    }

    public void delete(String lessonId, UUID requesterId) {
        requireAdmin(requesterId);
        lessonRepository.delete(getById(lessonId));
    }

    private void requireAdmin(UUID userId) {
        if (!userService.isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
