package com.genalpha.learningplatform.controller;

import com.genalpha.learningplatform.dto.ApiResponse;
import com.genalpha.learningplatform.model.ChatBot;
import com.genalpha.learningplatform.service.ChatBotService;
import com.genalpha.learningplatform.util.AuthUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "ChatBot", description = "Manage chatbot sessions per user")
@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatBotController {

    private final ChatBotService chatBotService;

    public ChatBotController(ChatBotService chatBotService) {
        this.chatBotService = chatBotService;
    }

    @Operation(summary = "List all chat sessions for the logged-in user")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<ChatBot>>> getMySessions(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(chatBotService.getByUserId(userId)));
    }

    @Operation(summary = "Get chat session by ID")
    @GetMapping("/{chatId}")
    public ResponseEntity<ApiResponse<ChatBot>> getById(@PathVariable UUID chatId, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(chatBotService.getById(chatId, requesterId)));
    }

    @Operation(summary = "Create a new chat session")
    @PostMapping
    public ResponseEntity<ApiResponse<ChatBot>> create(@RequestBody ChatBot chatBot, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(chatBotService.create(chatBot, requesterId)));
    }

    @Operation(summary = "Update a chat session")
    @PutMapping("/{chatId}")
    public ResponseEntity<ApiResponse<ChatBot>> update(@PathVariable UUID chatId,
                                                       @RequestBody ChatBot updates,
                                                       Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        return ResponseEntity.ok(ApiResponse.ok(chatBotService.update(chatId, updates, requesterId)));
    }

    @Operation(summary = "Delete a chat session (admin only)")
    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> delete(@PathVariable UUID chatId, Authentication authentication) {
        UUID requesterId = AuthUtils.userId(authentication);
        chatBotService.delete(chatId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
