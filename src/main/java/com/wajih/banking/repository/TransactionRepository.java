package com.wajih.banking.repository;

import com.wajih.banking.entity.Transaction;
import com.wajih.banking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByTimestampDesc(User user);
}
