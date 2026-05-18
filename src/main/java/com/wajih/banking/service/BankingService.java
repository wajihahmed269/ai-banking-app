package com.wajih.banking.service;

import com.wajih.banking.cache.AccountCacheService;
import com.wajih.banking.entity.Transaction;
import com.wajih.banking.entity.User;
import com.wajih.banking.repository.TransactionRepository;
import com.wajih.banking.repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BankingService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AccountCacheService accountCacheService;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Double getBalance(String username) {
        return accountCacheService.getBalance(username, () -> findByUsername(username).getBalance());
    }

    @Transactional
    public Transaction deposit(String username, Double amount, String source, String note) {
        if (amount <= 0) {
            throw new RuntimeException("Amount must be positive");
        }

        User user = userRepository.findByUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBalance(user.getBalance() + amount);
        userRepository.save(user);

        Transaction tx = newTransaction(user, "DEPOSIT", amount);
        tx.setSource(source);
        tx.setNote(note);
        tx.setReference(UUID.randomUUID().toString());
        Transaction saved = transactionRepository.save(tx);
        // Money mutations must invalidate short-lived account reads immediately.
        accountCacheService.evictAccount(username);
        return saved;
    }

    @Transactional
    public Transaction deposit(String username, Double amount) {
        return deposit(username, amount, null, null);
    }

    @Transactional
    public Transaction withdraw(String username, Double amount, String category, String note) {
        if (amount <= 0) {
            throw new RuntimeException("Amount must be positive");
        }

        User user = userRepository.findByUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        user.setBalance(user.getBalance() - amount);
        userRepository.save(user);

        Transaction tx = newTransaction(user, "WITHDRAWAL", amount);
        tx.setCategory(category);
        tx.setNote(note);
        tx.setReference(UUID.randomUUID().toString());
        Transaction saved = transactionRepository.save(tx);
        // Money mutations must invalidate short-lived account reads immediately.
        accountCacheService.evictAccount(username);
        return saved;
    }

    @Transactional
    public Transaction withdraw(String username, Double amount) {
        return withdraw(username, amount, null, null);
    }

    @Transactional
    public Transaction payBill(
            String username,
            String biller,
            Double amount,
            String category,
            String paymentMethod,
            String note
    ) {
        if (amount <= 0) {
            throw new RuntimeException("Amount must be positive");
        }

        User user = userRepository.findByUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        user.setBalance(user.getBalance() - amount);
        userRepository.save(user);

        Transaction tx = newTransaction(user, "PAYMENT", amount);
        tx.setBiller(biller);
        tx.setCategory(category);
        tx.setPaymentMethod(paymentMethod);
        tx.setNote(note);
        tx.setReference(UUID.randomUUID().toString());
        Transaction saved = transactionRepository.save(tx);
        // Money mutations must invalidate short-lived account reads immediately.
        accountCacheService.evictAccount(username);
        return saved;
    }

    @Transactional
    public Transaction transfer(String fromUsername, String toUsername, Double amount, String note) {
        if (amount <= 0) {
            throw new RuntimeException("Amount must be positive");
        }
        if (fromUsername.equals(toUsername)) {
            throw new RuntimeException("Cannot transfer to yourself");
        }

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

        String reference = UUID.randomUUID().toString();

        Transaction txOut = newTransaction(sender, "TRANSFER", amount);
        txOut.setRecipient(toUsername);
        txOut.setNote(note);
        txOut.setReference(reference);
        Transaction savedOut = transactionRepository.save(txOut);

        Transaction txIn = newTransaction(receiver, "TRANSFER", amount);
        txIn.setSource(fromUsername);
        txIn.setNote(note);
        txIn.setReference(reference);
        transactionRepository.save(txIn);

        // Transfer touches both accounts, so both balance and transaction caches are cleared.
        accountCacheService.evictAccount(fromUsername);
        accountCacheService.evictAccount(toUsername);
        return savedOut;
    }

    @Transactional
    public Transaction transfer(String fromUsername, String toUsername, Double amount) {
        return transfer(fromUsername, toUsername, amount, null);
    }

    public List<Transaction> getTransactions(String username) {
        return accountCacheService.getTransactions(username, () -> {
            User user = findByUsername(username);
            return transactionRepository.findByUserOrderByTimestampDesc(user);
        });
    }

    private Transaction newTransaction(User user, String type, Double amount) {
        Transaction tx = new Transaction();
        tx.setType(type);
        tx.setAmount(amount);
        tx.setUser(user);
        return tx;
    }
}
