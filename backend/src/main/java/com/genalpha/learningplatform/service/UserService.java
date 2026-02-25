package com.genalpha.learningplatform.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

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

    public boolean isAdmin(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> "Admin".equals(u.getRole()))
                .orElse(false);
    }

    public boolean isCollaborator(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> "Collaborator".equals(u.getRole()))
                .orElse(false);
    }
}
