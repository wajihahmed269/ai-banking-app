package com.wajih.banking.service;

import com.wajih.banking.entity.Transaction;
import com.wajih.banking.entity.User;
import com.wajih.banking.repository.TransactionRepository;
import com.wajih.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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

    @Transactional
    public void deposit(String username, Double amount) {
        if (amount <= 0) throw new RuntimeException("Amount must be positive");

        User user = userRepository.findByUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBalance(user.getBalance() + amount);
        userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setType("Deposit");
        tx.setAmount(amount);
        tx.setUser(user);
        transactionRepository.save(tx);
    }

    @Transactional
    public void withdraw(String username, Double amount) {
        if (amount <= 0) throw new RuntimeException("Amount must be positive");

        User user = userRepository.findByUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        user.setBalance(user.getBalance() - amount);
        userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setType("Withdrawal");
        tx.setAmount(amount);
        tx.setUser(user);
        transactionRepository.save(tx);
    }

    @Transactional
    public void transfer(String fromUsername, String toUsername, Double amount) {
        if (amount <= 0) throw new RuntimeException("Amount must be positive");
        if (fromUsername.equals(toUsername)) throw new RuntimeException("Cannot transfer to yourself");

        // Lock both accounts in consistent order to prevent deadlock
        String first = fromUsername.compareTo(toUsername) < 0 ? fromUsername : toUsername;
        String second = first.equals(fromUsername) ? toUsername : fromUsername;

        User userFirst = userRepository.findByUsernameWithLock(first)
                .orElseThrow(() -> new RuntimeException("User not found: " + first));
        User userSecond = userRepository.findByUsernameWithLock(second)
                .orElseThrow(() -> new RuntimeException("User not found: " + second));

        User sender = first.equals(fromUsername) ? userFirst : userSecond;
        User receiver = first.equals(fromUsername) ? userSecond : userFirst;

        if (sender.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        sender.setBalance(sender.getBalance() - amount);
        receiver.setBalance(receiver.getBalance() + amount);

        userRepository.save(sender);
        userRepository.save(receiver);

        String idempotencyKey = UUID.randomUUID().toString();

        Transaction txOut = new Transaction();
        txOut.setType("Transfer Out");
        txOut.setAmount(amount);
        txOut.setUser(sender);
        transactionRepository.save(txOut);

        Transaction txIn = new Transaction();
        txIn.setType("Transfer In");
        txIn.setAmount(amount);
        txIn.setUser(receiver);
        transactionRepository.save(txIn);
    }

    public List<Transaction> getTransactions(String username) {
        User user = findByUsername(username);
        return transactionRepository.findByUserOrderByTimestampDesc(user);
    }
}
