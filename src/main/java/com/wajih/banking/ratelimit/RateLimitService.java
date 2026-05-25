package com.wajih.banking.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock = Clock.systemUTC();

    @Value("${rate.limit.enabled:true}")
    private boolean enabled;

    @Value("${rate.limit.capacity:60}")
    private int defaultCapacity;

    @Value("${rate.limit.window-seconds:60}")
    private long windowSeconds;

    public RateLimitResult consume(String key, Integer limitOverride) {
        int limit = limitOverride == null || limitOverride <= 0 ? Math.max(1, defaultCapacity) : limitOverride;
        long windowMillis = Math.max(1, Duration.ofSeconds(windowSeconds).toMillis());
        if (!enabled) {
            return new RateLimitResult(true, limit, limit, windowMillis / 1000);
        }

        long now = clock.millis();
        Window window = windows.compute(key, (ignored, current) -> {
            if (current == null || now >= current.resetAtMillis()) {
                return new Window(now + windowMillis, 1);
            }
            return new Window(current.resetAtMillis(), current.count() + 1);
        });

        boolean allowed = window.count() <= limit;
        int remaining = Math.max(0, limit - window.count());
        long retryAfter = Math.max(1, (window.resetAtMillis() - now + 999) / 1000);
        return new RateLimitResult(allowed, limit, remaining, retryAfter);
    }

    private record Window(long resetAtMillis, int count) {
    }
}
