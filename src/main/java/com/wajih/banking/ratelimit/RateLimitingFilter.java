package com.wajih.banking.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final String LIMITED_MESSAGE = "Too many requests. Please try again later.";
    private static final List<Rule> RULES = List.of(
            new Rule("/api/auth/login", 5, false),
            new Rule("/api/auth/register", 3, false),
            new Rule("/api/ai/chat/", 20, true),
            new Rule("/api/deposit/", 10, true),
            new Rule("/api/transfer/", 10, true),
            new Rule("/api/payments/", 10, true)
    );

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Rule rule = matchingRule(request);
        if (rule == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = clientIp(request);
        String principal = rule.authenticatedKey() ? authenticatedPrincipal() : "anonymous";
        String key = request.getMethod() + ":" + rule.pathPrefix() + ":" + principal + ":" + ip;
        RateLimitResult result = rateLimitService.consume(key, rule.limit());

        response.setHeader("X-RateLimit-Limit", String.valueOf(result.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.remaining()));
        if (!result.allowed()) {
            response.setHeader("Retry-After", String.valueOf(result.retryAfterSeconds()));
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"" + LIMITED_MESSAGE + "\",\"data\":null}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Rule matchingRule(HttpServletRequest request) {
        if (!HttpMethod.POST.matches(request.getMethod())) {
            return null;
        }
        String path = request.getRequestURI();
        return RULES.stream()
                .filter(rule -> path.equals(rule.pathPrefix()) || path.startsWith(rule.pathPrefix()))
                .findFirst()
                .orElse(null);
    }

    private String authenticatedPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "anonymous";
        }
        return authentication.getName();
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private record Rule(String pathPrefix, int limit, boolean authenticatedKey) {
    }
}
