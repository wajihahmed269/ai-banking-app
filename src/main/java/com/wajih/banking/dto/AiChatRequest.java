package com.wajih.banking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiChatRequest {

    @NotBlank(message = "Message is required")
    private String message;
}
