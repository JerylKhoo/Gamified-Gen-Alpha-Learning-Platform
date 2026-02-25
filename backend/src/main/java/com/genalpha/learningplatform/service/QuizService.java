package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Quiz;
import com.genalpha.learningplatform.repository.QuizRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final UserService userService;

    public QuizService(QuizRepository quizRepository, UserService userService) {
        this.quizRepository = quizRepository;
        this.userService = userService;
    }

    public List<Quiz> getAll() {
        return quizRepository.findAll();
    }

    public Quiz getById(UUID quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
    }

    public List<Quiz> getByLesson(String lessonId) {
        return quizRepository.findByLessonId(lessonId);
    }

    public Quiz create(Quiz quiz, UUID requesterId) {
        requireAdmin(requesterId);
        quiz.setQuizId(null);
        return quizRepository.save(quiz);
    }

    public Quiz update(UUID quizId, Quiz updates, UUID requesterId) {
        requireAdmin(requesterId);
        Quiz quiz = getById(quizId);
        if (updates.getLessonId() != null) quiz.setLessonId(updates.getLessonId());
        if (updates.getQuestion() != null) quiz.setQuestion(updates.getQuestion());
        if (updates.getType() != null) quiz.setType(updates.getType());
        if (updates.getOptions() != null) quiz.setOptions(updates.getOptions());
        if (updates.getAnswer() != null) quiz.setAnswer(updates.getAnswer());
        return quizRepository.save(quiz);
    }

    public void delete(UUID quizId, UUID requesterId) {
        requireAdmin(requesterId);
        quizRepository.delete(getById(quizId));
    }

    private void requireAdmin(UUID userId) {
        if (!userService.isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
