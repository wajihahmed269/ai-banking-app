package com.wajih.banking.service;

import com.wajih.banking.entity.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    private final RestTemplate restTemplate;

    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

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
        requestBody.put("model", "llama3.2");
        requestBody.put("prompt", context.toString());
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                ollamaBaseUrl + "/api/generate",
                request,
                Map.class
            );
            Object result = response.getBody().get("response");
            return result != null ? result.toString() : "No response from AI.";
        } catch (ResourceAccessException e) {
            return "AI service is currently unavailable. Please try again later.";
        } catch (Exception e) {
            return "Unable to process your request right now.";
        }
    }
}
