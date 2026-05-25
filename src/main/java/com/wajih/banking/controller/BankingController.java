package com.wajih.banking.controller;

import com.wajih.banking.dto.ApiResponse;
import com.wajih.banking.dto.DepositRequest;
import com.wajih.banking.dto.PaymentRequest;
import com.wajih.banking.dto.TransactionResponse;
import com.wajih.banking.dto.TransferRequest;
import com.wajih.banking.dto.WithdrawRequest;
import com.wajih.banking.service.BankingService;
import com.wajih.banking.service.IdempotencyResult;
import com.wajih.banking.service.IdempotencyService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
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
    private final IdempotencyService idempotencyService;


    @GetMapping("/me/balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getMyBalance(Authentication authentication) {
        String username = authenticatedUsername(authentication);
        return ResponseEntity.ok(ApiResponse.success("Balance loaded", bankingService.getBalance(username)));
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getMyTransactions(Authentication authentication) {
        String username = authenticatedUsername(authentication);
        List<TransactionResponse> transactions = bankingService.getTransactions(username)
                .stream()
                .map(TransactionResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Transactions loaded", transactions));
    }

    @PostMapping("/me/deposit")
    public ResponseEntity<ApiResponse> depositForMe(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody DepositRequest request,
            Authentication authentication
    ) {
        String username = authenticatedUsername(authentication);
        return depositForUsername(username, idempotencyKey, request);
    }

    @PostMapping("/me/withdraw")
    public ResponseEntity<ApiResponse> withdrawForMe(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody WithdrawRequest request,
            Authentication authentication
    ) {
        String username = authenticatedUsername(authentication);
        return withdrawForUsername(username, idempotencyKey, request);
    }

    @PostMapping("/me/transfer")
    public ResponseEntity<ApiResponse> transferForMe(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody TransferRequest request,
            Authentication authentication
    ) {
        String username = authenticatedUsername(authentication);
        return transferForUsername(username, idempotencyKey, request);
    }

    @PostMapping("/me/payments")
    public ResponseEntity<ApiResponse> payBillForMe(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication
    ) {
        String username = authenticatedUsername(authentication);
        return payBillForUsername(username, idempotencyKey, request);
    }

    // Legacy username-path endpoint kept temporarily for older clients. Prefer /api/me/balance.
    @GetMapping("/balance/{username}")
    public ResponseEntity<ApiResponse<BigDecimal>> getBalance(
            @PathVariable String username,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        return ResponseEntity.ok(ApiResponse.success("Balance loaded", bankingService.getBalance(username)));
    }

    // Legacy username-path endpoint kept temporarily for older clients. Prefer /api/me/deposit.
    @PostMapping("/deposit/{username}")
    public ResponseEntity<ApiResponse> deposit(
            @PathVariable String username,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody DepositRequest request,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        return depositForUsername(username, idempotencyKey, request);
    }

    // Legacy username-path endpoint kept temporarily for older clients. Prefer /api/me/withdraw.
    @PostMapping("/withdraw/{username}")
    public ResponseEntity<ApiResponse> withdraw(
            @PathVariable String username,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody WithdrawRequest request,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        return withdrawForUsername(username, idempotencyKey, request);
    }

    // Legacy username-path endpoint kept temporarily for older clients. Prefer /api/me/transfer.
    @PostMapping("/transfer/{username}")
    public ResponseEntity<ApiResponse> transfer(
            @PathVariable String username,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody TransferRequest request,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        return transferForUsername(username, idempotencyKey, request);
    }

    // Legacy username-path endpoint kept temporarily for older clients. Prefer /api/me/payments.
    @PostMapping("/payments/{username}")
    public ResponseEntity<ApiResponse> payBill(
            @PathVariable String username,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        return payBillForUsername(username, idempotencyKey, request);
    }

    // Legacy username-path endpoint kept temporarily for older clients. Prefer /api/me/transactions.
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


    private ResponseEntity<ApiResponse> depositForUsername(
            String username,
            String idempotencyKey,
            DepositRequest request
    ) {
        IdempotencyResult<ApiResponse> result = idempotencyService.execute(
                idempotencyKey,
                username,
                "deposit",
                request,
                ApiResponse.class,
                () -> ApiResponse.success("Deposit successful", TransactionResponse.from(bankingService.deposit(
                        username,
                        request.getAmount(),
                        request.getSource(),
                        request.getNote()
                )))
        );
        return ResponseEntity.status(result.status()).body(result.body());
    }

    private ResponseEntity<ApiResponse> withdrawForUsername(
            String username,
            String idempotencyKey,
            WithdrawRequest request
    ) {
        IdempotencyResult<ApiResponse> result = idempotencyService.execute(
                idempotencyKey,
                username,
                "withdraw",
                request,
                ApiResponse.class,
                () -> ApiResponse.success("Withdrawal successful", TransactionResponse.from(bankingService.withdraw(
                        username,
                        request.getAmount(),
                        request.getCategory(),
                        request.getNote()
                )))
        );
        return ResponseEntity.status(result.status()).body(result.body());
    }

    private ResponseEntity<ApiResponse> transferForUsername(
            String username,
            String idempotencyKey,
            TransferRequest request
    ) {
        IdempotencyResult<ApiResponse> result = idempotencyService.execute(
                idempotencyKey,
                username,
                "transfer",
                request,
                ApiResponse.class,
                () -> ApiResponse.success("Transfer completed", TransactionResponse.from(bankingService.transfer(
                        username,
                        request.getToUsername(),
                        request.getAmount(),
                        request.getNote()
                )))
        );
        return ResponseEntity.status(result.status()).body(result.body());
    }

    private ResponseEntity<ApiResponse> payBillForUsername(
            String username,
            String idempotencyKey,
            PaymentRequest request
    ) {
        IdempotencyResult<ApiResponse> result = idempotencyService.execute(
                idempotencyKey,
                username,
                "payment",
                request,
                ApiResponse.class,
                () -> ApiResponse.success("Payment completed", TransactionResponse.from(bankingService.payBill(
                        username,
                        request.getBiller(),
                        request.getAmount(),
                        request.getCategory(),
                        request.getPaymentMethod(),
                        request.getNote()
                )))
        );
        return ResponseEntity.status(result.status()).body(result.body());
    }

    private String authenticatedUsername(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Authentication required");
        }
        return authentication.getName();
    }

    private void requireSelf(String username, Authentication authentication) {
        if (authentication == null || !username.equals(authentication.getName())) {
            throw new AccessDeniedException("You cannot access another user's account");
        }
    }
}
