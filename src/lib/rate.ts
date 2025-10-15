// src/lib/rate.ts
/**
 * Simple in-memory IP rate limiter. Returns normally if allowed.
 * Throws a 429 error when exceeded (caller can transform to JSON).
 * Does NOT log to audit_log; callers decide when to log.
 */
const WINDOW_MS = 15_000; // 15s window
const LIMIT = 20;         // 20 ops per window per IP

type Entry = { count: number; reset: number }
const bucket = new Map<string, Entry>()

export function throttle(ip: string) {
  const now = Date.now()
  const rec = bucket.get(ip)
  if (!rec || rec.reset < now) {
    bucket.set(ip, { count: 1, reset: now + WINDOW_MS })
    return
  }
  rec.count++
  if (rec.count > LIMIT) {
    const e = new Error('rate_limited') as Error & { status?: number }
    e.status = 429
    throw e
  }
}
