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
        if (!userId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot update another user's profile");
        }
        User user = getById(userId);
        if (updates.getName() != null) user.setName(updates.getName());
        if (updates.getProfilePic() != null) user.setProfilePic(updates.getProfilePic());
        if (updates.getPoints() != null) user.setPoints(updates.getPoints());
        // Role is intentionally not updatable via this endpoint
        return userRepository.save(user);
    }

    public boolean isAdmin(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> "Admin".equals(u.getRole()))
                .orElse(false);
    }
}
