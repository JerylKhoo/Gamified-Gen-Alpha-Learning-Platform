package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

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

    public User update(UUID userId, User updates, UUID requesterId) {
        boolean isAdmin = isAdmin(requesterId);

        if (!isAdmin && !userId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot update another user's profile");
        }

        User user = getById(userId);

        // Any user can update their own name and profilePic
        if (!isAdmin) {
            if (updates.getName() != null)       user.setName(updates.getName());
            if (updates.getProfilePic() != null) user.setProfilePic(updates.getProfilePic());
        } else {
            // Admins can update everything
            if (updates.getName() != null)       user.setName(updates.getName());
            if (updates.getProfilePic() != null) user.setProfilePic(updates.getProfilePic());
            if (updates.getPoints() != null)     user.setPoints(updates.getPoints());
            if (updates.getRole() != null)       user.setRole(updates.getRole());
        }

        return userRepository.save(user);
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
