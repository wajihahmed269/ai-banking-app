package com.wajih.banking.service;

import com.wajih.banking.entity.Transaction;
import com.wajih.banking.entity.User;
import com.wajih.banking.repository.TransactionRepository;
import com.wajih.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BankingService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Double getBalance(String username) {
        return findByUsername(username).getBalance();
    }

    public void deposit(String username, Double amount) {
        User user = findByUsername(username);
        user.setBalance(user.getBalance() + amount);
        userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setType("DEPOSIT");
        tx.setAmount(amount);
        tx.setUser(user);
        transactionRepository.save(tx);
    }

    public void withdraw(String username, Double amount) {
        User user = findByUsername(username);
        if (user.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }
        user.setBalance(user.getBalance() - amount);
        userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setType("WITHDRAWAL");
        tx.setAmount(amount);
        tx.setUser(user);
        transactionRepository.save(tx);
    }

    public List<Transaction> getTransactions(String username) {
        User user = findByUsername(username);
        return transactionRepository.findByUserOrderByTimestampDesc(user);
    }
}
