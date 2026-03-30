package com.genalpha.learningplatform.util;

import com.genalpha.learningplatform.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Shared admin access-control check used by service implementations.
 */
public final class AdminGuard {

    private AdminGuard() {}

    public static void requireAdmin(UserService userService, UUID userId) {
        if (!userService.isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
