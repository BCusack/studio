/**
 * Input validation and sanitization utilities for AI search
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    sanitized?: string;
}

// Blocked keywords/patterns that might indicate spam or inappropriate use
const BLOCKED_PATTERNS = [
    // Injection attempts
    /(<script|javascript:|data:|vbscript:)/i,
    // Excessive special characters (potential spam)
    /[^\w\s\-.,?!'"()]{5,}/,
    // Repeated characters (spam pattern)
    /(.)\1{10,}/,
    // Excessive length single word
    /\b\w{50,}\b/,
    // Multiple exclamation/question marks
    /[!?]{5,}/,
    // Excessive uppercase
    /[A-Z]{30,}/,
];

// Common spam phrases (extend as needed)
const SPAM_PHRASES = [
    'click here',
    'buy now',
    'limited time',
    'act now',
    'free money',
    'guaranteed',
    'no obligation',
    'risk free',
];

export function validateSearchQuery(query: string): ValidationResult {
    if (!query || typeof query !== 'string') {
        return {
            isValid: false,
            error: 'Query is required and must be a string',
        };
    }

    // Trim and normalize
    const trimmed = query.trim();

    // Check minimum length
    if (trimmed.length < 2) {
        return {
            isValid: false,
            error: 'Search query must be at least 2 characters long',
        };
    }

    // Check maximum length
    if (trimmed.length > 200) {
        return {
            isValid: false,
            error: 'Search query must be less than 200 characters',
        };
    }

    // Check for blocked patterns
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(trimmed)) {
            return {
                isValid: false,
                error: 'Query contains invalid characters or patterns',
            };
        }
    }

    // Check for spam phrases
    const lowerQuery = trimmed.toLowerCase();
    for (const phrase of SPAM_PHRASES) {
        if (lowerQuery.includes(phrase)) {
            return {
                isValid: false,
                error: 'Query contains content that appears to be spam',
            };
        }
    }

    // Basic sanitization
    const sanitized = trimmed
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[<>]/g, '') // Remove angle brackets
        .substring(0, 200); // Ensure max length

    return {
        isValid: true,
        sanitized,
    };
}

export function getClientIdentifier(request: Request): string {
    // Try to get real IP from headers (for production behind proxy)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwardedFor) {
        // Take the first IP from the comma-separated list
        return forwardedFor.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback to connection info (development)
    return 'unknown-client';
}

export function isQuerySimilar(query1: string, query2: string, threshold = 0.8): boolean {
    // Simple similarity check to detect repeated queries
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim();

    const norm1 = normalize(query1);
    const norm2 = normalize(query2);

    if (norm1 === norm2) return true;

    // Simple character-based similarity
    const longer = norm1.length > norm2.length ? norm1 : norm2;
    const shorter = norm1.length > norm2.length ? norm2 : norm1;

    if (longer.length === 0) return true;

    const editDistance = levenshteinDistance(shorter, longer);
    const similarity = (longer.length - editDistance) / longer.length;

    return similarity >= threshold;
}

function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }

    return matrix[str2.length][str1.length];
}