package com.genalpha.learningplatform.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * Request body for authentication endpoints carrying user credentials.
 */
@Getter
@Setter
public class AuthRequest {
    private String email;
    private String password;
}
