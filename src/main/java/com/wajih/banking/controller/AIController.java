package com.wajih.banking.controller;

import com.wajih.banking.dto.AiChatRequest;
import com.wajih.banking.dto.ApiResponse;
import com.wajih.banking.entity.Transaction;
import com.wajih.banking.service.AIService;
import com.wajih.banking.service.BankingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final BankingService bankingService;

    @PostMapping("/chat/{username}")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(
            @PathVariable String username,
            @Valid @RequestBody AiChatRequest request,
            Authentication authentication) {

        if (authentication == null || !username.equals(authentication.getName())) {
            throw new AccessDeniedException("You cannot access another user's assistant context");
        }

        String message = request.getMessage();
        double balance = bankingService.getBalance(username);
        List<Transaction> transactions = bankingService.getTransactions(username);

        String response = aiService.chat(message, balance, transactions);

        Map<String, String> res = new HashMap<>();
        res.put("response", response);
        return ResponseEntity.ok(ApiResponse.success("AI response generated", res));
    }
}
