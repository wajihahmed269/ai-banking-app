package com.wajih.banking.service;

import com.wajih.banking.entity.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AIService {

    private final RestTemplate restTemplate;

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
        requestBody.put("model", "tinyllama");
        requestBody.put("prompt", context.toString());
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://172.17.0.1:11434/api/generate",
                request,
                Map.class
            );
            return (String) response.getBody().get("response");
        } catch (Exception e) {
            return "AI service unavailable right now.";
        }
    }
}
