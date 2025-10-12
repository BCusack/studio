/**
 * Caching utilities for AI search results
 */

import { unstable_cache } from 'next/cache';
import type { GenerateDynamicMenuInput, GenerateDynamicMenuOutput } from '@/ai/schemas/dynamic-menu-schema';

interface CacheEntry {
    result: GenerateDynamicMenuOutput;
    timestamp: number;
    hitCount: number;
}

class SearchResultCache {
    private cache = new Map<string, CacheEntry>();
    private readonly maxSize = 100;
    private readonly ttlMs = 60 * 60 * 1000; // 1 hour

    private generateCacheKey(input: GenerateDynamicMenuInput): string {
        // Create a stable cache key from the input
        const filesHash = input.fileNames.sort().join('|');
        const queryNormalized = input.userQuery.toLowerCase().trim().replace(/\s+/g, ' ');
        return `${queryNormalized}:${filesHash}`;
    }

    get(input: GenerateDynamicMenuInput): GenerateDynamicMenuOutput | null {
        const key = this.generateCacheKey(input);
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }

        // Increment hit count
        entry.hitCount++;
        return entry.result;
    }

    set(input: GenerateDynamicMenuInput, result: GenerateDynamicMenuOutput): void {
        const key = this.generateCacheKey(input);

        // If cache is full, remove least recently used entry
        if (this.cache.size >= this.maxSize) {
            const oldestKey = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            result,
            timestamp: Date.now(),
            hitCount: 0,
        });
    }

    // Get cache stats for monitoring
    getStats() {
        const now = Date.now();
        const validEntries = Array.from(this.cache.values())
            .filter(entry => now - entry.timestamp <= this.ttlMs);

        return {
            size: this.cache.size,
            validEntries: validEntries.length,
            totalHits: validEntries.reduce((sum, entry) => sum + entry.hitCount, 0),
            hitRate: validEntries.length > 0
                ? validEntries.reduce((sum, entry) => sum + entry.hitCount, 0) / validEntries.length
                : 0,
        };
    }

    // Clean up expired entries
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttlMs) {
                this.cache.delete(key);
            }
        }
    }
}

// Global cache instance
const searchCache = new SearchResultCache();

// Cleanup every 30 minutes
setInterval(() => searchCache.cleanup(), 30 * 60 * 1000);

export { searchCache };

// Cached version of the dynamic menu generation with Next.js cache
export const getCachedDynamicMenu = unstable_cache(
    async (input: GenerateDynamicMenuInput): Promise<GenerateDynamicMenuOutput> => {
        // This will be replaced with the actual API call in the route handler
        throw new Error('This should not be called directly');
    },
    ['dynamic-menu'],
    {
        revalidate: 3600, // 1 hour
        tags: ['ai-search'],
    }
);