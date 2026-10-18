import { ApiError } from "./api";

// Simple fixed-window in-memory limiter. Fine for a single instance / demo;
// on serverless or multiple instances this should move to Redis (e.g. Upstash).
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const retryIn = Math.ceil((bucket.resetAt - now) / 1000);
    throw new ApiError(429, `Too many requests. Try again in ${retryIn}s.`);
  }
}

export function resetRateLimits() {
  buckets.clear();
}
