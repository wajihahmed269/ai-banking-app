package com.wajih.banking.service;

import com.wajih.banking.cache.AccountCacheService;
import com.wajih.banking.email.EmailService;
import com.wajih.banking.entity.Transaction;
import com.wajih.banking.notification.NotificationService;
import com.wajih.banking.entity.User;
import com.wajih.banking.repository.TransactionRepository;
import com.wajih.banking.repository.UserRepository;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BankingService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AccountCacheService accountCacheService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${money.max-transaction-amount:10000.00}")
    private BigDecimal maxTransactionAmount;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public BigDecimal getBalance(String username) {
        return accountCacheService.getBalance(username, () -> findByUsername(username).getBalance());
    }

    @Transactional
    public Transaction deposit(String username, BigDecimal amount, String source, String note) {
        validateMoneyAmount(amount);

        User user = userRepository.findByUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBalance(user.getBalance().add(amount));
        userRepository.save(user);

        Transaction tx = newTransaction(user, "DEPOSIT", amount);
        tx.setSource(source);
        tx.setNote(note);
        tx.setReference(UUID.randomUUID().toString());
        Transaction saved = transactionRepository.save(tx);
        recordSuccess(username, "Deposit completed", "Your deposit was completed.", "DEPOSIT");
        emailService.sendTransactionReceipt(username, "Deposit completed", "Your Zephyr deposit was completed.");
        // Money mutations must invalidate short-lived account reads immediately.
        accountCacheService.evictAccount(username);
        return saved;
    }

    @Transactional
    public Transaction deposit(String username, BigDecimal amount) {
        return deposit(username, amount, null, null);
    }

    @Transactional
    public Transaction withdraw(String username, BigDecimal amount, String category, String note) {
        validateMoneyAmount(amount);

        User user = userRepository.findByUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        user.setBalance(user.getBalance().subtract(amount));
        userRepository.save(user);

        Transaction tx = newTransaction(user, "WITHDRAWAL", amount);
        tx.setCategory(category);
        tx.setNote(note);
        tx.setReference(UUID.randomUUID().toString());
        Transaction saved = transactionRepository.save(tx);
        recordSuccess(username, "Withdrawal completed", "Your withdrawal was completed.", "WITHDRAWAL");
        emailService.sendTransactionReceipt(username, "Withdrawal completed", "Your Zephyr withdrawal was completed.");
        // Money mutations must invalidate short-lived account reads immediately.
        accountCacheService.evictAccount(username);
        return saved;
    }

    @Transactional
    public Transaction withdraw(String username, BigDecimal amount) {
        return withdraw(username, amount, null, null);
    }

    @Transactional
    public Transaction payBill(
            String username,
            String biller,
            BigDecimal amount,
            String category,
            String paymentMethod,
            String note
    ) {
        validateMoneyAmount(amount);

        User user = userRepository.findByUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        user.setBalance(user.getBalance().subtract(amount));
        userRepository.save(user);

        Transaction tx = newTransaction(user, "PAYMENT", amount);
        tx.setBiller(biller);
        tx.setCategory(category);
        tx.setPaymentMethod(paymentMethod);
        tx.setNote(note);
        tx.setReference(UUID.randomUUID().toString());
        Transaction saved = transactionRepository.save(tx);
        recordSuccess(username, "Payment completed", "Your bill payment was completed.", "PAYMENT");
        emailService.sendTransactionReceipt(username, "Payment completed", "Your Zephyr bill payment was completed.");
        // Money mutations must invalidate short-lived account reads immediately.
        accountCacheService.evictAccount(username);
        return saved;
    }

    @Transactional
    public Transaction transfer(String fromUsername, String toUsername, BigDecimal amount, String note) {
        validateMoneyAmount(amount);
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

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

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
        recordSuccess(fromUsername, "Transfer completed", "Your transfer was completed.", "TRANSFER");
        recordSuccess(toUsername, "Transfer received", "A transfer was credited to your account.", "TRANSFER");
        emailService.sendTransactionReceipt(fromUsername, "Transfer completed", "Your Zephyr transfer was completed.");

        // Transfer touches both accounts, so both balance and transaction caches are cleared.
        accountCacheService.evictAccount(fromUsername);
        accountCacheService.evictAccount(toUsername);
        return savedOut;
    }

    @Transactional
    public Transaction transfer(String fromUsername, String toUsername, BigDecimal amount) {
        return transfer(fromUsername, toUsername, amount, null);
    }

    public List<Transaction> getTransactions(String username) {
        return accountCacheService.getTransactions(username, () -> {
            User user = findByUsername(username);
            return transactionRepository.findByUserOrderByTimestampDesc(user);
        });
    }

    private void validateMoneyAmount(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new RuntimeException("Amount must be positive");
        }
        if (amount.scale() > 2) {
            throw new RuntimeException("Amount must have no more than 2 decimal places");
        }
        if (amount.compareTo(maxTransactionAmount) > 0) {
            throw new RuntimeException("Amount exceeds maximum transaction limit");
        }
    }

    private void recordSuccess(String username, String title, String message, String type) {
        notificationService.create(username, title, message, type);
    }

    private Transaction newTransaction(User user, String type, BigDecimal amount) {
        Transaction tx = new Transaction();
        tx.setType(type);
        tx.setAmount(amount);
        tx.setUser(user);
        return tx;
    }
}
