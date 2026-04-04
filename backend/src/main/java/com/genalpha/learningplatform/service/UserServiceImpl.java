package com.genalpha.learningplatform.service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.genalpha.learningplatform.model.Role;
import com.genalpha.learningplatform.model.User;
import com.genalpha.learningplatform.repository.UserRepository;

/**
 * Concrete implementation of UserService backed by JPA.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service.key}")
    private String supabaseServiceKey;

    public UserServiceImpl(UserRepository userRepository, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
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
                .map(u -> Role.Admin.name().equals(u.getRole()))
                .orElse(false);
    }

    @Override
    public boolean isCollaborator(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> Role.Collaborator.name().equals(u.getRole()))
                .orElse(false);
    }

    @Override
    public boolean isContributorOrAbove(UUID userId) {
        return userRepository.findById(userId)
                .map(u -> Role.Collaborator.name().equals(u.getRole()) || Role.Admin.name().equals(u.getRole()))
                .orElse(false);
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User updateRole(UUID userId, String role, UUID requesterId) {
        if (!isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can change user roles");
        }
        if (!Role.isValid(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role);
        }
        User target = getById(userId);
        if (Role.Admin.name().equals(target.getRole()) && !userId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify another admin's role");
        }
        userRepository.updateRole(userId, role);
        return getById(userId);
    }

    @Override
    @Transactional
    public void incrementReportCount(UUID userId) {
        userRepository.incrementReportCount(userId);
    }

    @Override
    @Transactional
    public void decrementReportCount(UUID userId, int count) {
        userRepository.decrementReportCount(userId, count);
    }

    @Override
    @Transactional
    public void deleteUser(UUID userId, UUID requesterId) {
        if (!isAdmin(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can delete users");
        }
        User target = getById(userId);
        if (Role.Admin.name().equals(target.getRole()) && !userId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another admin's account");
        }

        // Delete from Supabase Auth first using the service role key
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseServiceKey);
        headers.set("Authorization", "Bearer " + supabaseServiceKey);
        try {
            restTemplate.exchange(
                supabaseUrl + "/auth/v1/admin/users/" + userId,
                HttpMethod.DELETE,
                new HttpEntity<>(headers),
                Void.class
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete Supabase auth user: " + e.getMessage());
        }

        // DB row will cascade-delete via FK constraints
        userRepository.deleteById(userId);
    }

    @Override
    public List<User> getLeaderboard() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparingInt((User u) -> u.getPoints() != null ? u.getPoints() : 0).reversed())
                .toList();
    }
}
