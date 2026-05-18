package com.wajih.banking.dto;

import com.wajih.banking.entity.Transaction;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private String type;
    private Double amount;
    private LocalDateTime timestamp;
    private String source;
    private String note;
    private String recipient;
    private String biller;
    private String category;
    private String paymentMethod;
    private String reference;

    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getTimestamp(),
                transaction.getSource(),
                transaction.getNote(),
                transaction.getRecipient(),
                transaction.getBiller(),
                transaction.getCategory(),
                transaction.getPaymentMethod(),
                transaction.getReference()
        );
    }
}
