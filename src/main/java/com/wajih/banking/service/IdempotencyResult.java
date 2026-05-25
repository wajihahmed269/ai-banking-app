package com.wajih.banking.service;

public record IdempotencyResult<T>(int status, T body, boolean replayed) {
}
