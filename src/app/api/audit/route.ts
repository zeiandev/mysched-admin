// src/app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase-service'
import { requireAdmin } from '@/lib/authz'

function bad(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status })
}

export const dynamic = 'force-dynamic'

type AuditDbRow = {
  id: number
  at?: string
  created_at?: string
  user_id: string | null
  table_name: string | null
  action: string | null
  row_id: number | string | null
  details?: unknown
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const sp = new URL(req.url).searchParams
    const table = sp.get('table')
    const user_id = sp.get('user_id')
    const limitRaw = Number(sp.get('limit') || '0')
    const limit = Math.min(200, limitRaw > 0 ? limitRaw : 200)

    const svc = sbService()
    const colsPreferred = 'id, at, user_id, table_name, action, row_id, details'

    let q = svc.from('audit_log').select(colsPreferred).limit(limit)
    if (table && table !== 'all') q = q.eq('table_name', table)
    if (user_id) q = q.eq('user_id', user_id)

    const resp = await q.order('at', { ascending: false })
    let rows: AuditDbRow[] | null = (resp.data as AuditDbRow[] | null) ?? null
    const err1 = resp.error

    // Fallback if "at" column is not present in this environment
    if (err1 && err1.code === '42703') {
      const colsFallback = 'id, created_at, user_id, table_name, action, row_id, details'
      let q2 = svc.from('audit_log').select(colsFallback).limit(limit)
      if (table && table !== 'all') q2 = q2.eq('table_name', table)
      if (user_id) q2 = q2.eq('user_id', user_id)

      const resp2 = await q2.order('created_at', { ascending: false })
      if (resp2.error) return bad('Failed to load audit log', 500)

      const raw = (resp2.data as AuditDbRow[] | null) ?? []
      rows = raw.map((r) => ({
        ...r,
        at: r.at ?? r.created_at, // normalize for the UI
      }))
      return NextResponse.json(rows ?? [])
    }

    if (err1) return bad('Failed to load audit log', 500)
    return NextResponse.json(rows ?? [])
  } catch (e: unknown) {
    const msg = (e as { message?: string } | null)?.message
    if (msg === 'unauthorized') return bad('Unauthorized', 401)
    if (msg === 'forbidden') return bad('Forbidden', 403)
    return bad('Failed to load audit log', 500)
  }
}
