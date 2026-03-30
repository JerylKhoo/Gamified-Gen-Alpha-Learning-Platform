package com.genalpha.learningplatform.util;

import org.springframework.security.core.Authentication;

import java.util.UUID;

/**
 * Shared utility for extracting the authenticated user's UUID from a Spring Security Authentication object.
 */
public final class AuthUtils {

    private AuthUtils() {}

    public static UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
