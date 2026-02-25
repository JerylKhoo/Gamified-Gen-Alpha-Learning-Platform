package com.genalpha.learningplatform.service;

import com.genalpha.learningplatform.dto.AuthRequest;
import com.genalpha.learningplatform.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public AuthResponse login(AuthRequest request) {
        HttpHeaders headers = buildHeaders();
        Map<String, String> body = Map.of(
                "email", request.getEmail(),
                "password", request.getPassword()
        );

        try {
            ResponseEntity<AuthResponse> response = restTemplate.exchange(
                    supabaseUrl + "/auth/v1/token?grant_type=password",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    AuthResponse.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    public AuthResponse register(AuthRequest request) {
        HttpHeaders headers = buildHeaders();
        Map<String, String> body = Map.of(
                "email", request.getEmail(),
                "password", request.getPassword()
        );

        try {
            ResponseEntity<AuthResponse> response = restTemplate.exchange(
                    supabaseUrl + "/auth/v1/signup",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    AuthResponse.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration failed: " + e.getMessage());
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        return headers;
    }
}
