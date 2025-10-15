// src/lib/csrf.ts
import type { NextRequest } from 'next/server'

/**
 * Accepts requests that are same-origin (by host) or match an allowed origin list.
 * Works across localhost, Vercel preview, and prod custom domains.
 */
export function assertSameOrigin(req: NextRequest): void {
  const url = req.nextUrl
  const reqHost = url.host.toLowerCase()

  // Build allowlist
  const allow = new Set<string>()
  // current host is always allowed (SSR / same-site POST)
  allow.add(reqHost)

  // Optional env allow-list (comma separated)
  const extra =
    process.env.NEXT_PUBLIC_SITE_URLS ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ''
  for (const v of extra.split(',').map(s => s.trim()).filter(Boolean)) {
    try {
      allow.add(new URL(v).host.toLowerCase())
    } catch {}
  }

  // Check Origin, then Referer
  const origin = req.headers.get('origin')
  if (origin) {
    try {
      const oh = new URL(origin).host.toLowerCase()
      if (allow.has(oh)) return
    } catch {}
  }

  const referer = req.headers.get('referer')
  if (referer) {
    try {
      const rh = new URL(referer).host.toLowerCase()
      if (allow.has(rh)) return
    } catch {}
  }

  const e = new Error('csrf') as Error & { status?: number }
  e.status = 403
  throw e
}
