package com.genalpha.learningplatform.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.UserRepository;

/**
 * Concrete implementation of UserService backed by JPA.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final com.genalpha.learningplatform.repository.ChatBotRepository chatBotRepository;

    public UserServiceImpl(UserRepository userRepository, com.genalpha.learningplatform.repository.ChatBotRepository chatBotRepository) {
        this.userRepository = userRepository;
        this.chatBotRepository = chatBotRepository;
    }

    @Override
    public User getById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Override
    @Transactional
    public User update(UUID userId, User updates, UUID requesterId) {
        boolean isAdmin = isAdmin(requesterId);

        if (!isAdmin && !userId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot update another user's profile");
        }
        // Use a direct JPQL update so Hibernate never touches the JSONB points column
        userRepository.updateProfile(
                userId,
                updates.getName(),
                updates.getProfilePic()
        );
        return getById(userId);
    }

    @Override
    public boolean isAdmin(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> "Admin".equals(u.getRole()))
                .orElse(false);
    }

    @Override
    public boolean isCollaborator(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> "Collaborator".equals(u.getRole()))
                .orElse(false);
    }

    @Override
    public List<User> getLeaderboard() {
        List<User> users = new java.util.ArrayList<>(userRepository.findAll());
        users.sort((User a, User b) -> {
            int pa = a.getPoints() != null ? a.getPoints() : 0;
            int pb = b.getPoints() != null ? b.getPoints() : 0;
            return Integer.compare(pb, pa);
        });
        return users;
    }

    @Override
    public List<com.genalpha.learningplatform.dto.AgentLeaderboardDTO> getAgentLeaderboard() {
        java.util.List<com.genalpha.learningplatform.model.ChatBot> chatBots = chatBotRepository.findAll();
        java.util.Map<UUID, Integer> maxScores = new java.util.HashMap<>();
        
        for (com.genalpha.learningplatform.model.ChatBot cb : chatBots) {
            int score = cb.getScore() != null ? cb.getScore() : 0;
            if (!maxScores.containsKey(cb.getUserId()) || score > maxScores.get(cb.getUserId())) {
                maxScores.put(cb.getUserId(), score);
            }
        }
        
        java.util.List<User> allUsers = userRepository.findAll();
        java.util.List<com.genalpha.learningplatform.dto.AgentLeaderboardDTO> results = new java.util.ArrayList<>();
        
        for (User u : allUsers) {
            int agentScore = maxScores.getOrDefault(u.getUserId(), 0);
            if (agentScore > 0) {
                results.add(new com.genalpha.learningplatform.dto.AgentLeaderboardDTO(
                    u.getUserId(), u.getName(), u.getProfilePic(), agentScore
                ));
            }
        }
        
        results.sort((a, b) -> Integer.compare(b.getAgentScore(), a.getAgentScore()));
        return results;
    }
}
