interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export function rateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 60000): { success: boolean; remaining: number } {
    const now = Date.now();
    
    if (!store[identifier] || now > store[identifier].resetTime) {
        store[identifier] = {
            count: 1,
            resetTime: now + windowMs,
        };
        return { success: true, remaining: maxRequests - 1 };
    }
    
    if (store[identifier].count >= maxRequests) {
        return { success: false, remaining: 0 };
    }
    
    store[identifier].count++;
    return { success: true, remaining: maxRequests - store[identifier].count };
}
