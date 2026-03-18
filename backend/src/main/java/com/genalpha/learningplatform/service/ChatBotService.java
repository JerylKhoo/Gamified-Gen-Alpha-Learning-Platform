package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.ChatBot;
import com.genalpha.learningplatform.repository.ChatBotRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ChatBotService {

    private final ChatBotRepository chatBotRepository;
    private final UserService userService;

    public ChatBotService(ChatBotRepository chatBotRepository, UserService userService) {
        this.chatBotRepository = chatBotRepository;
        this.userService = userService;
    }

    public List<ChatBot> getByUserId(UUID userId) {
        return chatBotRepository.findByUserId(userId);
    }

    public ChatBot getById(UUID chatId, UUID requesterId) {
        ChatBot chatBot = chatBotRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found"));
        if (!chatBot.getUserId().equals(requesterId) && !userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return chatBot;
    }

    public ChatBot create(ChatBot chatBot, UUID requesterId) {
        chatBot.setChatId(null);
        chatBot.setUserId(requesterId);
        if (chatBot.getScore() == null)       chatBot.setScore(0);
        if (chatBot.getChatHistory() == null) chatBot.setChatHistory("{}");
        return chatBotRepository.save(chatBot);
    }

    public ChatBot update(UUID chatId, ChatBot updates, UUID requesterId) {
        ChatBot chatBot = getById(chatId, requesterId);
        if (updates.getScore() != null)       chatBot.setScore(updates.getScore());
        if (updates.getChatHistory() != null) chatBot.setChatHistory(updates.getChatHistory());
        return chatBotRepository.save(chatBot);
    }

    public void delete(UUID chatId, UUID requesterId) {
        if (!userService.isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        ChatBot chatBot = chatBotRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found"));
        chatBotRepository.delete(chatBot);
    }
}
