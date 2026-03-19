package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.AuthRequest;
import com.genalpha.learningplatform.dto.AuthResponse;

/**
 * Defines authentication operations delegated to the Supabase Auth API.
 */
public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse register(AuthRequest request);
}
