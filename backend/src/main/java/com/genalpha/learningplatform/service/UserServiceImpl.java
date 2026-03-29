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

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
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
    public boolean isContributorOrAbove(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> "Collaborator".equals(u.getRole()) || "Admin".equals(u.getRole()))
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
}
