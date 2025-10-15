// src/lib/csrf.ts
import { NextRequest } from 'next/server';

/**
 * CSRF/Origin guard for state-changing requests.
 * - Allows same host (Origin host === Host)
 * - Also allows an explicit allowed origin from env
 *   (NEXT_PUBLIC_SITE_URL), plus localhost for dev
 * - Throws Error('bad-origin') on failure
 */
export function assertSameOrigin(req: NextRequest) {
  const m = req.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(m)) return; // only guard state-changing

  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  const referer = req.headers.get('referer');
  if (!host) throw new Error('bad-origin');
  if (!origin && !referer) throw new Error('bad-origin');

  const allowed = process.env.NEXT_PUBLIC_SITE_URL?.toString();
  const isDev = process.env.NODE_ENV !== 'production';

  function ok(urlStr?: string | null) {
    if (!urlStr) return false;
    try {
      const u = new URL(urlStr);
      if (u.host === host) return true; // same host (scheme ignored)
      if (isDev && u.hostname === 'localhost') return true; // permit localhost only in dev
      if (allowed && u.origin === allowed) return true; // explicit allow from env
      return false;
    } catch {
      return false;
    }
  }

  if (!ok(origin) && !ok(referer)) throw new Error('bad-origin');
}

// Optional backward-compatible export if some files used verifyCsrf
export const verifyCsrf = assertSameOrigin;
