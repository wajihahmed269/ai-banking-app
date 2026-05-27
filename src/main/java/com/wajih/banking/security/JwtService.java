package com.wajih.banking.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@Slf4j

public class JwtService {

    private static final long EXPIRATION_MILLIS = 24 * 60 * 60 * 1000L;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final SecretKey signingKey;

    public JwtService(
            @Value("${JWT_SECRET:${jwt.secret:}}") String configuredSecret,
            @Value("${spring.datasource.url:}") String datasourceUrl,
            @Value("${spring.datasource.username:}") String datasourceUsername,
            @Value("${spring.datasource.password:}") String datasourcePassword
    ) {
        String secret = configuredSecret == null || configuredSecret.isBlank()
                ? fallbackSecret(datasourceUrl, datasourceUsername, datasourcePassword)
                : configuredSecret;
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private String fallbackSecret(String datasourceUrl, String datasourceUsername, String datasourcePassword) {
        if (isBlank(datasourceUrl) || isBlank(datasourceUsername) || isBlank(datasourcePassword)) {
            return generateEphemeralSecret();
        }
        log.warn("JWT_SECRET is not configured. Deriving a stable fallback signing key from datasource configuration; configure JWT_SECRET for production.");
        return Base64.getEncoder().encodeToString(sha256(
                "zephyr-jwt|" + datasourceUrl + "|" + datasourceUsername + "|" + datasourcePassword
        ));
    }

    private String generateEphemeralSecret() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        log.warn("JWT_SECRET is not configured. Using an ephemeral development signing key; existing tokens will be invalid after restart.");
        return Base64.getEncoder().encodeToString(bytes);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private byte[] sha256(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
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
