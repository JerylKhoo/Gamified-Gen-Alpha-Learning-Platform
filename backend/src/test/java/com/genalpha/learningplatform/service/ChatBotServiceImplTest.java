package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.ChatBot;
import com.genalpha.learningplatform.repository.ChatBotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ChatBotServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ChatBotServiceImpl Unit Tests")
class ChatBotServiceImplTest {

    @Mock
    private ChatBotRepository chatBotRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private ChatBotServiceImpl chatBotService;

    private UUID userId;
    private UUID adminId;
    private ChatBot chatBot;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        adminId = UUID.randomUUID();
        chatBot = new ChatBot();
        chatBot.setSessionId(UUID.randomUUID());
        chatBot.setUserId(userId);
        chatBot.setScore(0);
        chatBot.setChatHistory("{}");
    }

    @Test
    @DisplayName("Should return chat list when chats exist for user")
    void getByUserId_returnsChatList() {
        // Arrange
        List<ChatBot> expectedChats = List.of(chatBot);
        when(chatBotRepository.findByUserId(userId)).thenReturn(expectedChats);

        // Act
        List<ChatBot> result = chatBotService.getByUserId(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(userId, result.get(0).getUserId());
        verify(chatBotRepository, times(1)).findByUserId(userId);
    }

    @Test
    @DisplayName("Should return chat when requester is the owner")
    void getById_returnsChat_whenOwner() {
        // Arrange
        UUID chatId = chatBot.getSessionId();
        when(chatBotRepository.findById(chatId)).thenReturn(Optional.of(chatBot));

        // Act
        ChatBot result = chatBotService.getById(chatId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(chatId, result.getSessionId());
        verify(chatBotRepository, times(1)).findById(chatId);
    }

    @Test
    @DisplayName("Should return chat when requester is admin")
    void getById_returnsChat_whenAdmin() {
        // Arrange
        UUID chatId = chatBot.getSessionId();
        when(chatBotRepository.findById(chatId)).thenReturn(Optional.of(chatBot));
        when(userService.isAdmin(adminId)).thenReturn(true);

        // Act
        ChatBot result = chatBotService.getById(chatId, adminId);

        // Assert
        assertNotNull(result);
        assertEquals(chatId, result.getSessionId());
        verify(chatBotRepository, times(1)).findById(chatId);
        verify(userService, times(1)).isAdmin(adminId);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is neither owner nor admin")
    void getById_throwsForbidden_whenNeitherOwnerNorAdmin() {
        // Arrange
        UUID chatId = chatBot.getSessionId();
        UUID otherId = UUID.randomUUID();
        when(chatBotRepository.findById(chatId)).thenReturn(Optional.of(chatBot));
        when(userService.isAdmin(otherId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> chatBotService.getById(chatId, otherId));
        assertNotNull(exception);
        verify(chatBotRepository, times(1)).findById(chatId);
        verify(userService, times(1)).isAdmin(otherId);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when chat session does not exist")
    void getById_throwsNotFound_whenMissing() {
        // Arrange
        UUID missingId = UUID.randomUUID();
        when(chatBotRepository.findById(missingId)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> chatBotService.getById(missingId, userId));
        assertNotNull(exception);
        verify(chatBotRepository, times(1)).findById(missingId);
    }

    @Test
    @DisplayName("Should set owner and defaults then save when creating chat session")
    void create_setsOwnerAndDefaultsAndSaves() {
        // Arrange
        ChatBot input = new ChatBot();
        when(chatBotRepository.save(any(ChatBot.class))).thenReturn(chatBot);

        // Act
        chatBotService.create(input, userId);

        // Assert
        assertEquals(userId, input.getUserId());
        assertEquals(0, input.getScore());
        assertEquals("{}", input.getChatHistory());
        verify(chatBotRepository, times(1)).save(input);
    }

    @Test
    @DisplayName("Should update chat fields when requester is the owner")
    void update_updatesFields_whenOwner() {
        // Arrange
        UUID chatId = chatBot.getSessionId();
        when(chatBotRepository.findById(chatId)).thenReturn(Optional.of(chatBot));
        ChatBot updates = new ChatBot();
        updates.setScore(10);
        updates.setChatHistory("{\"messages\":[]}");
        when(chatBotRepository.save(chatBot)).thenReturn(chatBot);

        // Act
        ChatBot result = chatBotService.update(chatId, updates, userId);

        // Assert
        assertNotNull(result);
        assertEquals(10, result.getScore());
        assertEquals("{\"messages\":[]}", result.getChatHistory());
        verify(chatBotRepository, times(1)).findById(chatId);
        verify(chatBotRepository, times(1)).save(chatBot);
    }

    @Test
    @DisplayName("Should delete chat session when requester is admin")
    void delete_deletesChat_whenAdmin() {
        // Arrange
        UUID chatId = chatBot.getSessionId();
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(chatBotRepository.findById(chatId)).thenReturn(Optional.of(chatBot));

        // Act
        chatBotService.delete(chatId, adminId);

        // Assert
        verify(userService, times(1)).isAdmin(adminId);
        verify(chatBotRepository, times(1)).findById(chatId);
        verify(chatBotRepository, times(1)).delete(chatBot);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin")
    void delete_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(userId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> chatBotService.delete(UUID.randomUUID(), userId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(userId);
        verify(chatBotRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when chat session does not exist during delete")
    void delete_throwsNotFound_whenChatMissing() {
        // Arrange
        UUID missingId = UUID.randomUUID();
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(chatBotRepository.findById(missingId)).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> chatBotService.delete(missingId, adminId));
        assertNotNull(exception);
        verify(chatBotRepository, times(1)).findById(missingId);
        verify(chatBotRepository, never()).delete(any());
    }
}
