package com.wajih.banking.ratelimit;

import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {

    private static final long WINDOW_MILLIS = 60_000L;

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock;

    public RateLimitService() {
        this(Clock.systemUTC());
    }

    RateLimitService(Clock clock) {
        this.clock = clock;
    }

    public RateLimitResult consume(String key, int limit) {
        long now = clock.millis();
        Window window = windows.compute(key, (ignored, current) -> {
            if (current == null || now >= current.resetAtMillis()) {
                return new Window(now + WINDOW_MILLIS, 1);
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
