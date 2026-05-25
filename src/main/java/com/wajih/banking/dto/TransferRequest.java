package com.wajih.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransferRequest {

    @NotBlank(message = "Recipient username is required")
    private String toUsername;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
    @Digits(integer = 12, fraction = 2, message = "Amount must have no more than 2 decimal places")
    private java.math.BigDecimal amount;

    private String note;
}
