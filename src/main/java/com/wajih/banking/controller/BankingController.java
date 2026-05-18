package com.wajih.banking.controller;

import com.wajih.banking.dto.ApiResponse;
import com.wajih.banking.dto.DepositRequest;
import com.wajih.banking.dto.PaymentRequest;
import com.wajih.banking.dto.TransactionResponse;
import com.wajih.banking.dto.TransferRequest;
import com.wajih.banking.dto.WithdrawRequest;
import com.wajih.banking.service.BankingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BankingController {

    private final BankingService bankingService;

    @GetMapping("/balance/{username}")
    public ResponseEntity<ApiResponse<Double>> getBalance(
            @PathVariable String username,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        return ResponseEntity.ok(ApiResponse.success("Balance loaded", bankingService.getBalance(username)));
    }

    @PostMapping("/deposit/{username}")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(
            @PathVariable String username,
            @Valid @RequestBody DepositRequest request,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        TransactionResponse transaction = TransactionResponse.from(bankingService.deposit(
                username,
                request.getAmount(),
                request.getSource(),
                request.getNote()
        ));
        return ResponseEntity.ok(ApiResponse.success("Deposit successful", transaction));
    }

    @PostMapping("/withdraw/{username}")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(
            @PathVariable String username,
            @Valid @RequestBody WithdrawRequest request,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        TransactionResponse transaction = TransactionResponse.from(bankingService.withdraw(
                username,
                request.getAmount(),
                request.getCategory(),
                request.getNote()
        ));
        return ResponseEntity.ok(ApiResponse.success("Withdrawal successful", transaction));
    }

    @PostMapping("/transfer/{username}")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @PathVariable String username,
            @Valid @RequestBody TransferRequest request,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        TransactionResponse transaction = TransactionResponse.from(bankingService.transfer(
                username,
                request.getToUsername(),
                request.getAmount(),
                request.getNote()
        ));
        return ResponseEntity.ok(ApiResponse.success("Transfer completed", transaction));
    }

    @PostMapping("/payments/{username}")
    public ResponseEntity<ApiResponse<TransactionResponse>> payBill(
            @PathVariable String username,
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        TransactionResponse transaction = TransactionResponse.from(bankingService.payBill(
                username,
                request.getBiller(),
                request.getAmount(),
                request.getCategory(),
                request.getPaymentMethod(),
                request.getNote()
        ));
        return ResponseEntity.ok(ApiResponse.success("Payment completed", transaction));
    }

    @GetMapping("/transactions/{username}")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @PathVariable String username,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        List<TransactionResponse> transactions = bankingService.getTransactions(username)
                .stream()
                .map(TransactionResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Transactions loaded", transactions));
    }

    private void requireSelf(String username, Authentication authentication) {
        if (authentication == null || !username.equals(authentication.getName())) {
            throw new AccessDeniedException("You cannot access another user's account");
        }
    }
}
