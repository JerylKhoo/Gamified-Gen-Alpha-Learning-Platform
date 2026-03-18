package com.genalpha.learningplatform.repository;

import com.genalpha.learningplatform.model.ChatBot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatBotRepository extends JpaRepository<ChatBot, UUID> {
    List<ChatBot> findByUserId(UUID userId);
}
