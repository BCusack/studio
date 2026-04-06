import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicMenu } from '@/ai/flows/dynamic-menu-generation';
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limit';
import { validateSearchQuery, getClientIdentifier, isQuerySimilar } from '@/lib/validation';
import { searchCache } from '@/lib/search-cache';
import type { GenerateDynamicMenuInput } from '@/ai/schemas/dynamic-menu-schema';

// Track recent queries per client to detect similar spam
const recentQueries = new Map<string, { queries: string[]; timestamps: number[] }>();

// Clean up old queries every 10 minutes
setInterval(() => {
    const cutoff = Date.now() - 15 * 60 * 1000; // 15 minutes ago
    for (const [clientId, data] of recentQueries.entries()) {
        const validIndices = data.timestamps
            .map((ts, i) => ts > cutoff ? i : -1)
            .filter(i => i >= 0);

        if (validIndices.length === 0) {
            recentQueries.delete(clientId);
        } else {
            data.queries = validIndices.map(i => data.queries[i]);
            data.timestamps = validIndices.map(i => data.timestamps[i]);
        }
    }
}, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, fileNames } = body;

        // Get client identifier
        const clientId = getClientIdentifier(request);

        // Validate input
        const validation = validateSearchQuery(query);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error, type: 'validation' },
                { status: 400 }
            );
        }

        const sanitizedQuery = validation.sanitized!;

        // Check rate limiting
        const rateLimitResult = rateLimiter.check(clientId, RATE_LIMITS.AI_SEARCH);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: rateLimitResult.isBlocked
                        ? 'Too many requests. You have been temporarily blocked. Please try again later.'
                        : 'Rate limit exceeded. Please wait before making another request.',
                    type: 'rate_limit',
                    resetTime: rateLimitResult.resetTime,
                    isBlocked: rateLimitResult.isBlocked,
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                    }
                }
            );
        }

        // Check for similar recent queries (spam detection)
        const clientData = recentQueries.get(clientId);
        if (clientData) {
            const similarQuery = clientData.queries.find(q => isQuerySimilar(q, sanitizedQuery));
            if (similarQuery) {
                return NextResponse.json(
                    { error: 'Similar query was recently submitted. Please try a different search.', type: 'duplicate' },
                    { status: 429 }
                );
            }
        }

        // Validate file names
        if (!Array.isArray(fileNames) || fileNames.length === 0) {
            return NextResponse.json(
                { error: 'Valid file names are required', type: 'validation' },
                { status: 400 }
            );
        }

        // Create search input
        const searchInput: GenerateDynamicMenuInput = {
            fileNames,
            userQuery: sanitizedQuery,
        };

        // Check cache first
        let result = searchCache.get(searchInput);
        const wasFromCache = result !== null;

        if (!result) {
            // Generate new result
            try {
                result = await generateDynamicMenu(searchInput);

                // Cache the result
                searchCache.set(searchInput, result);
            } catch (error) {
                console.error('AI generation failed:', error);
                return NextResponse.json(
                    { error: 'AI service temporarily unavailable. Please try again later.', type: 'ai_error' },
                    { status: 503 }
                );
            }
        }

        // Track query for spam detection
        const now = Date.now();
        if (!recentQueries.has(clientId)) {
            recentQueries.set(clientId, { queries: [], timestamps: [] });
        }
        const data = recentQueries.get(clientId)!;
        data.queries.push(sanitizedQuery);
        data.timestamps.push(now);

        // Keep only last 10 queries per client
        if (data.queries.length > 10) {
            data.queries = data.queries.slice(-10);
            data.timestamps = data.timestamps.slice(-10);
        }

        return NextResponse.json({
            ...result,
            cached: wasFromCache,
            remaining: rateLimitResult.remaining,
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', type: 'server_error' },
            { status: 500 }
        );
    }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
    const allowedOrigin = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://theseonproject.com';
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}