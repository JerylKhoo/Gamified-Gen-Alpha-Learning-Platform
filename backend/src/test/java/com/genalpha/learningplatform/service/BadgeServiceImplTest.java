package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.model.Badge;
import com.genalpha.learningplatform.repository.BadgeRepository;
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
import static org.mockito.Mockito.*;

/**
 * Unit tests for BadgeServiceImpl.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BadgeServiceImpl Unit Tests")
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
    @DisplayName("Should return all badges when badges exist")
    void getAll_returnsBadgeList() {
        // Arrange
        List<Badge> expectedBadges = List.of(badge);
        when(badgeRepository.findAll()).thenReturn(expectedBadges);

        // Act
        List<Badge> actualBadges = badgeService.getAll();

        // Assert
        assertNotNull(actualBadges);
        assertEquals(1, actualBadges.size());
        assertEquals(expectedBadges, actualBadges);
        verify(badgeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return badge when badge exists")
    void getById_returnsBadge_whenFound() {
        // Arrange
        when(badgeRepository.findById("first-login")).thenReturn(Optional.of(badge));

        // Act
        Badge result = badgeService.getById("first-login");

        // Assert
        assertNotNull(result);
        assertEquals("first-login", result.getBadgeId());
        verify(badgeRepository, times(1)).findById("first-login");
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when badge does not exist")
    void getById_throwsNotFound_whenMissing() {
        // Arrange
        when(badgeRepository.findById("x")).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> badgeService.getById("x"));
        assertNotNull(exception);
        verify(badgeRepository, times(1)).findById("x");
    }

    @Test
    @DisplayName("Should save and return badge when requester is admin")
    void create_savesBadge_whenAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(true);
        when(badgeRepository.save(badge)).thenReturn(badge);

        // Act
        Badge result = badgeService.create(badge, adminId);

        // Assert
        assertNotNull(result);
        assertEquals("first-login", result.getBadgeId());
        verify(userService, times(1)).isAdmin(adminId);
        verify(badgeRepository, times(1)).save(badge);
    }

    @Test
    @DisplayName("Should throw ResponseStatusException when requester is not admin")
    void create_throwsForbidden_whenNotAdmin() {
        // Arrange
        when(userService.isAdmin(adminId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> badgeService.create(badge, adminId));
        assertNotNull(exception);
        verify(userService, times(1)).isAdmin(adminId);
        verify(badgeRepository, never()).save(any());
    }
}
