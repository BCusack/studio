/**
 * Rate limiting utilities for spam protection
 */

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    blockDurationMs?: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    isBlocked: boolean;
}

class InMemoryRateLimit {
    private requests = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>();

    check(identifier: string, config: RateLimitConfig): RateLimitResult {
        const now = Date.now();
        const key = identifier;
        const existing = this.requests.get(key);

        // Check if currently blocked
        if (existing?.blockedUntil && existing.blockedUntil > now) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: existing.blockedUntil,
                isBlocked: true,
            };
        }

        // Reset window if expired
        if (!existing || existing.resetTime <= now) {
            this.requests.set(key, {
                count: 1,
                resetTime: now + config.windowMs,
            });
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: now + config.windowMs,
                isBlocked: false,
            };
        }

        // Increment count
        existing.count++;

        // Check if limit exceeded
        if (existing.count > config.maxRequests) {
            // Block for specified duration if configured
            if (config.blockDurationMs) {
                existing.blockedUntil = now + config.blockDurationMs;
            }

            return {
                allowed: false,
                remaining: 0,
                resetTime: existing.resetTime,
                isBlocked: !!config.blockDurationMs,
            };
        }

        return {
            allowed: true,
            remaining: config.maxRequests - existing.count,
            resetTime: existing.resetTime,
            isBlocked: false,
        };
    }

    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.requests.entries()) {
            if (value.resetTime <= now && (!value.blockedUntil || value.blockedUntil <= now)) {
                this.requests.delete(key);
            }
        }
    }
}

// Global rate limiter instance
const rateLimiter = new InMemoryRateLimit();

// Cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

export { rateLimiter };

// Default rate limit configurations
export const RATE_LIMITS = {
    AI_SEARCH: {
        maxRequests: 10, // 10 requests
        windowMs: 15 * 60 * 1000, // per 15 minutes
        blockDurationMs: 30 * 60 * 1000, // block for 30 minutes if exceeded
    },
    AI_SEARCH_STRICT: {
        maxRequests: 3, // 3 requests
        windowMs: 5 * 60 * 1000, // per 5 minutes
        blockDurationMs: 60 * 60 * 1000, // block for 1 hour if exceeded
    },
} as const;