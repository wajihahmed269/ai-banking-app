package com.wajih.banking.controller;

import com.wajih.banking.entity.Transaction;
import com.wajih.banking.service.AIService;
import com.wajih.banking.service.BankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, String>> chat(
            @PathVariable String username,
            @RequestBody Map<String, String> body) {

        String message = body.get("message");
        double balance = bankingService.getBalance(username);
        List<Transaction> transactions = bankingService.getTransactions(username);

        String response = aiService.chat(message, balance, transactions);

        Map<String, String> res = new HashMap<>();
        res.put("response", response);
        return ResponseEntity.ok(res);
    }
}
