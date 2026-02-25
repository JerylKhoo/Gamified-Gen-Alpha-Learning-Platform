package com.genalpha.learningplatform.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

/**
 * Converts a Supabase JWT into a Spring Security authentication token.
 *
 * Supabase JWT claims used:
 *   - "sub"  → user UUID (maps to USER_ID in the USER table)
 *   - "role" → "authenticated" or "anon" (Supabase DB role)
 *   - "email"→ user email
 */
@Component
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        // Use "sub" (UUID) as the principal name so controllers can call
        // authentication.getName() to get the Supabase user ID
        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        String supabaseRole = jwt.getClaimAsString("role");

        if ("authenticated".equals(supabaseRole)) {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }

        // "anon" or anything else → no authorities (blocked by .anyRequest().authenticated())
        return List.of();
    }
}
