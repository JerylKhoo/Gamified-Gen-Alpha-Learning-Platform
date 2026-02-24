package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Question;
import com.genalpha.learningplatform.repository.QuestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserService userService;

    public QuestionService(QuestionRepository questionRepository, UserService userService) {
        this.questionRepository = questionRepository;
        this.userService = userService;
    }

    public List<Question> getAll() {
        return questionRepository.findAll();
    }

    public Question getById(UUID questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
    }

    public List<Question> getByLesson(String lessonId) {
        return questionRepository.findByLessonId(lessonId);
    }

    public Question create(Question question, UUID requesterId) {
        requireAdmin(requesterId);
        question.setQuestionId(null);
        return questionRepository.save(question);
    }

    public Question update(UUID questionId, Question updates, UUID requesterId) {
        requireAdmin(requesterId);
        Question question = getById(questionId);
        if (updates.getLessonId() != null) question.setLessonId(updates.getLessonId());
        if (updates.getQuestion() != null) question.setQuestion(updates.getQuestion());
        if (updates.getOptions() != null) question.setOptions(updates.getOptions());
        if (updates.getAnswer() != null) question.setAnswer(updates.getAnswer());
        if (updates.getExplanation() != null) question.setExplanation(updates.getExplanation());
        return questionRepository.save(question);
    }

    public void delete(UUID questionId, UUID requesterId) {
        requireAdmin(requesterId);
        questionRepository.delete(getById(questionId));
    }

    private void requireAdmin(UUID userId) {
        if (!userService.isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
