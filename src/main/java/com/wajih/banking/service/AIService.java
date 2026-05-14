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

    public String chat(String userMessage, double balance, List<Transaction> transactions) {
        StringBuilder context = new StringBuilder();
        context.append("You are a helpful banking assistant. ");
        context.append("Current balance: $").append(String.format("%.2f", balance)).append(". ");

        if (!transactions.isEmpty()) {
            context.append("Recent transactions: ");
            transactions.stream().limit(5).forEach(tx ->
                context.append(tx.getType()).append(" $")
                       .append(String.format("%.2f", tx.getAmount())).append(", ")
            );
        }

        context.append("User question: ").append(userMessage);
        context.append(" Answer briefly in 2-3 sentences.");

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
                log.error("Ollama returned an empty response body from {}", generateUrl());
                return "No response from AI.";
            }
            Object result = body.get("response");
            return result != null ? result.toString() : "No response from AI.";
        } catch (HttpStatusCodeException e) {
            log.error(
                "Ollama request failed with status {} and body: {}",
                e.getStatusCode(),
                e.getResponseBodyAsString(),
                e
            );
            return "Unable to process your request right now.";
        } catch (ResourceAccessException e) {
            log.error("Unable to reach Ollama at {}", generateUrl(), e);
            return "AI service is currently unavailable. Please try again later.";
        } catch (Exception e) {
            log.error("Unexpected error while processing AI chat request", e);
            return "Unable to process your request right now.";
        }
    }

    private String generateUrl() {
        return ollamaBaseUrl.replaceAll("/+$", "") + "/api/generate";
    }
}
