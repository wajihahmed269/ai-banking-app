package com.wajih.banking.repository;

import com.wajih.banking.entity.IdempotencyRecord;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IdempotencyRecordRepository extends JpaRepository<IdempotencyRecord, Long> {

    Optional<IdempotencyRecord> findByUsernameAndActionAndIdempotencyKey(
            String username,
            String action,
            String idempotencyKey
    );
}
