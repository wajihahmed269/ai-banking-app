package com.wajih.banking.controller;

import com.wajih.banking.entity.Transaction;
import com.wajih.banking.service.BankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BankingController {

    private final BankingService bankingService;

    @GetMapping("/balance/{username}")
    public ResponseEntity<Double> getBalance(@PathVariable String username) {
        return ResponseEntity.ok(bankingService.getBalance(username));
    }

    @PostMapping("/deposit/{username}")
    public ResponseEntity<String> deposit(@PathVariable String username,
                                          @RequestBody Map<String, Double> body) {
        bankingService.deposit(username, body.get("amount"));
        return ResponseEntity.ok("Deposit successful");
    }

    @PostMapping("/withdraw/{username}")
    public ResponseEntity<String> withdraw(@PathVariable String username,
                                           @RequestBody Map<String, Double> body) {
        bankingService.withdraw(username, body.get("amount"));
        return ResponseEntity.ok("Withdrawal successful");
    }

    @GetMapping("/transactions/{username}")
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable String username) {
        return ResponseEntity.ok(bankingService.getTransactions(username));
    }
}
