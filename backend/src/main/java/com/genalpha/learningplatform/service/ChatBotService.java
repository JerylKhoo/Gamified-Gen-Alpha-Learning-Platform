package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.ChatBot;
import java.util.List;
import java.util.UUID;

/**
 * Defines chatbot session management operations for the learning platform.
 */
public interface ChatBotService {
    List<ChatBot> getByUserId(UUID userId);
    ChatBot getById(UUID chatId, UUID requesterId);
    ChatBot create(ChatBot chatBot, UUID requesterId);
    ChatBot update(UUID chatId, ChatBot updates, UUID requesterId);
    void delete(UUID chatId, UUID requesterId);
}
