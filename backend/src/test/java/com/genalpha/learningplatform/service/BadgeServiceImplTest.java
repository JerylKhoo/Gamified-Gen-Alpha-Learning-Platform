package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Badge;
import com.genalpha.learningplatform.repository.BadgeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BadgeServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
class BadgeServiceImplTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private BadgeServiceImpl badgeService;

    private UUID adminId;
    private Badge badge;

    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        badge = new Badge();
        badge.setBadgeId("first-login");
        badge.setDescription("Logged in for the first time");
    }

    @Test
    void getAll_returnsBadgeList() {
        when(badgeRepository.findAll()).thenReturn(List.of(badge));

        List<Badge> result = badgeService.getAll();

        assertThat(result).hasSize(1);
    }

    @Test
    void getById_returnsBadge_whenFound() {
        when(badgeRepository.findById("first-login")).thenReturn(Optional.of(badge));

        Badge result = badgeService.getById("first-login");

        assertThat(result.getBadgeId()).isEqualTo("first-login");
    }

    @Test
    void getById_throwsNotFound_whenMissing() {
        when(badgeRepository.findById("x")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> badgeService.getById("x"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Badge not found");
    }

    @Test
    void create_savesBadge_whenAdmin() {
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(badgeRepository.save(badge)).thenReturn(badge);

        Badge result = badgeService.create(badge, adminId);

        assertThat(result.getBadgeId()).isEqualTo("first-login");
    }

    @Test
    void create_throwsForbidden_whenNotAdmin() {
        when(userService.isAdmin(adminId)).thenReturn(false);

        assertThatThrownBy(() -> badgeService.create(badge, adminId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Admin access required");
    }
}
