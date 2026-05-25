package com.wajih.banking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wajih.banking.entity.IdempotencyRecord;
import com.wajih.banking.exception.IdempotencyConflictException;
import com.wajih.banking.repository.IdempotencyRecordRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_COMPLETED = "COMPLETED";

    private final IdempotencyRecordRepository idempotencyRecordRepository;
    private final ObjectMapper objectMapper;

    @Value("${idempotency.retention-hours:24}")
    private long retentionHours;

    @Transactional
    public <T> IdempotencyResult<T> execute(
            String idempotencyKey,
            String username,
            String action,
            Object request,
            Class<T> responseType,
            Supplier<T> operation
    ) {
        String normalizedKey = validateKey(idempotencyKey);
        String requestHash = hash(request);

        IdempotencyRecord existing = idempotencyRecordRepository
                .findByUsernameAndActionAndIdempotencyKey(username, action, normalizedKey)
                .orElse(null);
        if (existing != null) {
            return replayOrConflict(existing, requestHash, responseType);
        }

        IdempotencyRecord record = new IdempotencyRecord();
        record.setIdempotencyKey(normalizedKey);
        record.setUsername(username);
        record.setAction(action);
        record.setRequestHash(requestHash);
        record.setStatus(STATUS_IN_PROGRESS);
        record.setResponseStatus(202);
        record.setExpiresAt(LocalDateTime.now().plusHours(Math.max(1, retentionHours)));

        try {
            idempotencyRecordRepository.saveAndFlush(record);
        } catch (DataIntegrityViolationException exception) {
            IdempotencyRecord duplicate = idempotencyRecordRepository
                    .findByUsernameAndActionAndIdempotencyKey(username, action, normalizedKey)
                    .orElseThrow(() -> new IdempotencyConflictException("Duplicate request is already in progress"));
            return replayOrConflict(duplicate, requestHash, responseType);
        }

        T response = operation.get();
        record.setStatus(STATUS_COMPLETED);
        record.setResponseStatus(200);
        record.setResponseBody(write(response));
        idempotencyRecordRepository.save(record);
        return new IdempotencyResult<>(200, response, false);
    }

    private String validateKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency-Key header is required for this money action");
        }
        String trimmed = idempotencyKey.trim();
        if (trimmed.length() > 128) {
            throw new IllegalArgumentException("Idempotency-Key must be 128 characters or fewer");
        }
        return trimmed;
    }

    private <T> IdempotencyResult<T> replayOrConflict(
            IdempotencyRecord record,
            String requestHash,
            Class<T> responseType
    ) {
        if (!record.getRequestHash().equals(requestHash)) {
            throw new IdempotencyConflictException("Idempotency-Key was already used with a different request");
        }
        if (!STATUS_COMPLETED.equals(record.getStatus())) {
            throw new IdempotencyConflictException("Duplicate request is already in progress");
        }
        return new IdempotencyResult<>(record.getResponseStatus(), read(record.getResponseBody(), responseType), true);
    }

    private String hash(Object request) {
        try {
            byte[] json = objectMapper.writeValueAsBytes(request);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(json));
        } catch (JsonProcessingException | NoSuchAlgorithmException exception) {
            throw new IllegalArgumentException("Unable to process idempotency request hash");
        }
    }

    private String write(Object response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Unable to store idempotency response");
        }
    }

    private <T> T read(String responseBody, Class<T> responseType) {
        try {
            return objectMapper.readValue(responseBody.getBytes(StandardCharsets.UTF_8), responseType);
        } catch (Exception exception) {
            throw new IdempotencyConflictException("Stored idempotency response could not be read");
        }
    }
}
