package com.wajih.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Size(max = 64, message = "Username must be 64 characters or fewer")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 4, max = 128, message = "Password must be between 4 and 128 characters")
    private String password;
}
