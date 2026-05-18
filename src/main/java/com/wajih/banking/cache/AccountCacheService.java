package com.wajih.banking.cache;

import com.wajih.banking.entity.Transaction;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;
import org.springframework.stereotype.Service;

@Service
public class AccountCacheService {

    private static final Duration BALANCE_TTL = Duration.ofSeconds(15);
    private static final Duration TRANSACTIONS_TTL = Duration.ofSeconds(30);

    private final Map<String, CacheEntry<Double>> balanceCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry<List<Transaction>>> transactionCache = new ConcurrentHashMap<>();

    public Double getBalance(String username, Supplier<Double> loader) {
        return get(balanceCache, username, BALANCE_TTL, loader);
    }

    public List<Transaction> getTransactions(String username, Supplier<List<Transaction>> loader) {
        return get(transactionCache, username, TRANSACTIONS_TTL, () -> List.copyOf(loader.get()));
    }

    public void evictAccount(String username) {
        balanceCache.remove(username);
        transactionCache.remove(username);
    }

    private <T> T get(Map<String, CacheEntry<T>> cache, String key, Duration ttl, Supplier<T> loader) {
        long now = System.currentTimeMillis();
        CacheEntry<T> current = cache.get(key);
        if (current != null && now < current.expiresAtMillis()) {
            return current.value();
        }

        T loaded = loader.get();
        cache.put(key, new CacheEntry<>(loaded, now + ttl.toMillis()));
        return loaded;
    }

    private record CacheEntry<T>(T value, long expiresAtMillis) {
    }
}
