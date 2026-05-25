package com.wajih.banking.service;

import com.wajih.banking.entity.Transaction;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final RestTemplate restTemplate;

    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:llama3.2:3b}")
    private String ollamaModel;

    @Value("${ollama.connect-timeout-ms:10000}")
    private int ollamaConnectTimeoutMs;

    @Value("${ollama.read-timeout-ms:120000}")
    private int ollamaReadTimeoutMs;

    @PostConstruct
    void configureTimeouts() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(ollamaConnectTimeoutMs);
        requestFactory.setReadTimeout(ollamaReadTimeoutMs);
        restTemplate.setRequestFactory(requestFactory);
    }

    public String chat(String userMessage, BigDecimal balance, List<Transaction> transactions) {
        if (userMessage == null || userMessage.isBlank()) {
            return "Please enter a banking or support question.";
        }
        String normalized = userMessage.toLowerCase();
        if (isUnsafeRequest(normalized)) {
            return "I cannot help with bypassing security or abusing financial systems. I can help explain safe account protection steps or how to report suspicious activity.";
        }

        StringBuilder context = new StringBuilder();
        context.append("You are Zephyr support, a banking app assistant. ");
        context.append("Use concise, safe guidance. Do not expose internal system details. ");
        context.append("For investing or financial advice questions, provide educational information only, explain risk, ask about goals, time horizon, and risk tolerance, and recommend consulting a qualified financial advisor for serious decisions. ");
        context.append("Current balance: $").append(balance).append(". ");

        if (!transactions.isEmpty()) {
            context.append("Recent transactions: ");
            transactions.stream().limit(5).forEach(tx ->
                context.append(tx.getType()).append(" $")
                       .append(tx.getAmount()).append(", ")
            );
        }

        context.append("User question: ").append(userMessage);
        context.append(" Answer briefly in 2-3 sentences. If the question is about app support, explain the relevant Zephyr feature and common failure reasons.");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", ollamaModel);
        requestBody.put("prompt", context.toString());
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                generateUrl(),
                request,
                Map.class
            );
            Map body = response.getBody();
            if (body == null) {
                log.warn("Ollama returned an empty response body");
                return "No response from AI.";
            }
            Object result = body.get("response");
            return result != null ? result.toString() : "No response from AI.";
        } catch (HttpStatusCodeException e) {
            log.warn("Ollama request failed with status {}", e.getStatusCode());
            return "Unable to process your request right now.";
        } catch (ResourceAccessException e) {
            log.warn("Unable to reach Ollama service");
            return "AI service is currently unavailable. Please try again later.";
        } catch (Exception e) {
            log.error("Unexpected error while processing AI chat request", e);
            return "Unable to process your request right now.";
        }
    }

    private boolean isUnsafeRequest(String normalized) {
        return normalized.contains("bypass")
                || normalized.contains("steal")
                || normalized.contains("hack")
                || normalized.contains("phishing")
                || normalized.contains("dump credentials")
                || normalized.contains("exfiltrate")
                || normalized.contains("disable security");
    }

    private String generateUrl() {
        return ollamaBaseUrl.replaceAll("/+$", "") + "/api/generate";
    }
}
