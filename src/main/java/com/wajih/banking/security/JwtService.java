package com.wajih.banking.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final long EXPIRATION_MILLIS = 24 * 60 * 60 * 1000L;
    private static final String DEVELOPMENT_SECRET =
            "zephyr-development-secret-change-me-minimum-32-bytes";

    private final SecretKey signingKey;

    public JwtService(@Value("${JWT_SECRET:${jwt.secret:}}") String configuredSecret) {
        String secret = configuredSecret == null || configuredSecret.isBlank()
                ? DEVELOPMENT_SECRET
                : configuredSecret;
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .claim("roles", List.of("ROLE_USER"))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(EXPIRATION_MILLIS)))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
