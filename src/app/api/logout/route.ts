import { NextResponse } from 'next/server'
import { logErr } from '@/lib/log'
import { auditError } from '@/lib/audit'
import { sbServer } from '@/lib/supabase-server'

/**
 * POST /api/logout
 * Clears Supabase auth cookie and redirects to /login.
 */
export async function POST() {
  try {
    const sb = await sbServer()
    await sb.auth.signOut()
    const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const redirectTo = `${base}/login`
    const res = NextResponse.redirect(redirectTo, { status: 302 })
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'same-origin')
    return res
  } catch (e) {
    const msg = logErr('/api/logout POST', e, {})
    await auditError('system', 'logout', msg)
    const res = NextResponse.json({ error: msg || 'Internal Server Error' }, { status: 500 })
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'same-origin')
    return res
  }
}
