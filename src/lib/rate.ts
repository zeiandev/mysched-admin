// Simple in-memory rate limiter (best-effort, single-instance only)
// WINDOW_MS: window length; LIMIT: allowed operations per key per window.
const WINDOW_MS = 60_000;
const LIMIT = 60;
type Entry = { n: number; t: number };
const bucket: Map<string, Entry> = new Map();

// Periodic cleanup to avoid unbounded memory growth. Removes entries
// that haven't been touched for > 1 window.
const CLEAN_INTERVAL = WINDOW_MS; // run once per window
let cleanerStarted = false;
function startCleaner() {
  if (cleanerStarted) return;
  cleanerStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of bucket.entries()) {
      if (now - v.t > WINDOW_MS) bucket.delete(k);
    }
  }, CLEAN_INTERVAL).unref?.();
}

// Simple in-memory IP rate limiter (single process).
// 60 requests / minute per IP.
export function throttle(ip: string) {
  startCleaner();
  const key = ip || '0';
  const now = Date.now();
  const e = bucket.get(key);
  if (!e || now - e.t > WINDOW_MS) {
    bucket.set(key, { n: 1, t: now });
    return;
  }
  e.n += 1;
  if (e.n > LIMIT) throw new Error('rate-limit');
}

// Optional helper for tests / debugging
export function _rateSnapshot() {
  return Array.from(bucket.entries());
}
