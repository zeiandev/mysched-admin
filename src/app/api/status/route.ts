import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { sbService } from '@/lib/supabase-service'
import { logErr } from '@/lib/log'
import { auditError } from '@/lib/audit'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue }

/** Utility: Safe count on a table. */
async function safeCount(table: string) {
  try {
    const { count, error } = await sbService()
      .from(table)
      .select('*', { count: 'exact', head: true })
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

/** Utility: Get most recent update timestamp. */
async function safeLastUpdate(table: string): Promise<string | null> {
  const sb = sbService()
  try {
    const { data, error } = await sb
      .from(table)
      .select('updated_at,created_at')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .single()
    if (error || !data) return null
    const rec = data as { updated_at?: string | null; created_at?: string | null }
    return rec.updated_at ?? rec.created_at ?? null
  } catch {
    return null
  }
}

/**
 * GET /api/status
 * Returns env + DB health and current user + admin status.
 */
export async function GET() {
  try {
    let latencyMs = 0
    let ok = true
    let authOk = true

    const env = {
      nodeEnv: process.env.NODE_ENV || 'development',
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasSupabaseAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE),
      hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    }

    // DB ping
    try {
      const t0 = Date.now()
      const ping = await sbService().from('sections').select('*', { count: 'exact', head: true })
      latencyMs = Date.now() - t0
      if (ping.error) ok = false
    } catch {
      ok = false
    }

    // Schema/auth table availability
    try {
      const authPing = await sbService().from('admins').select('user_id', { head: true, count: 'exact' }).limit(0)
      if (authPing.error) authOk = false
    } catch {
      authOk = false
    }

    // ------- CURRENT USER via SSR client (read-only cookie bridge) -------
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},    // read-only in this route
        remove: () => {}, // read-only in this route
      },
    })

    const gu = await supabase.auth.getUser()
    const user = gu.data?.user ?? null
    const userId = user?.id ?? null

    let isAdmin = false
    if (user) {
      const meta: Record<string, unknown> = { ...(user.app_metadata ?? {}), ...(user.user_metadata ?? {}) }
      const toLowerStr = (v: unknown): string | null => (typeof v === 'string' ? v.toLowerCase() : null)
      const toLowerStrArray = (v: unknown): string[] => {
        if (Array.isArray(v)) return v.map(x => String(x).toLowerCase())
        if (typeof v === 'string') return v.split(',').map(s => s.trim().toLowerCase())
        return []
      }
      const isTrue = (v: unknown): boolean => v === true || (typeof v === 'string' && v.toLowerCase() === 'true')

      const roles = toLowerStrArray(meta['roles'])
      const roleVal = toLowerStr(meta['role'])
      const isAdminFlag = isTrue(meta['is_admin'])
      const adminFlag = isTrue(meta['admin'])
      if (roleVal === 'admin' || roles.includes('admin') || isAdminFlag || adminFlag) {
        isAdmin = true
      }
      const allowedEmails = (process.env.NEXT_ADMIN_EMAILS || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
      if (!isAdmin && user.email && allowedEmails.includes(user.email.toLowerCase())) {
        isAdmin = true
      }
      if (!isAdmin) {
        const { data } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle()
        isAdmin = Boolean(data)
      }
      if (!isAdmin) {
        try {
          const svc = sbService()
          const { data } = await svc
            .from('admins')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle()
          isAdmin = Boolean(data)
        } catch {}
      }
    }

    const [classesCount, sectionsCount, errorsCount] = await Promise.all([
      safeCount('classes'),
      safeCount('sections'),
      safeCount('audit_log'),
    ])

    const [classesUpdated, sectionsUpdated] = await Promise.all([
      safeLastUpdate('classes'),
      safeLastUpdate('sections'),
    ])

    let recentErrors: Array<{ id: number; table_name: string | null; message?: string | null; created_at: string | null }> = []
    try {
      const { data } = await sbService()
        .from('audit_log')
        .select('id, table_name, details, created_at')
        .order('created_at', { ascending: false })
        .limit(20)

      recentErrors = (data || [])
        .map(rec => {
          const r = rec as Record<string, JsonValue>
          let message: string | null = null
          const detailsVal = r.details
          if (detailsVal && typeof detailsVal === 'object' && !Array.isArray(detailsVal)) {
            const obj = detailsVal as Record<string, JsonValue>
            const m = obj.message || obj.error
            if (typeof m === 'string') message = m
          }
          return {
            id: typeof r.id === 'number' ? r.id : Number(r.id),
            table_name: typeof r.table_name === 'string' ? r.table_name : null,
            message,
            created_at: typeof r.created_at === 'string' ? r.created_at : null,
          }
        })
        .filter(x => x.message)
        .slice(0, 5)
    } catch {}

    const payload = {
      db: { ok, latencyMs },
      auth: { ok: authOk, authed: Boolean(userId), userId, isAdmin },
      counts: { classes: classesCount, sections: sectionsCount, errors: errorsCount },
      lastUpdate: { classes: classesUpdated, sections: sectionsUpdated },
      recentErrors,
      hasUrl: env.hasSupabaseUrl,
      hasKey: env.hasSupabaseAnon,
      env: { ...env, supabaseEnvOk: env.hasSupabaseUrl && env.hasSupabaseAnon },
    }

    const res = NextResponse.json(payload, { status: 200 })
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'same-origin')
    return res
  } catch (e) {
    const msg = logErr('/api/status GET', e, {})
    await auditError('system', 'status', msg)
    const res = NextResponse.json({ error: msg || 'Internal Server Error' }, { status: 500 })
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'same-origin')
    return res
  }
}
