// src/app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase-service'
import { requireAdmin } from '@/lib/authz'

function bad(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status })
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin() // admin only

    const sp = new URL(req.url).searchParams
    const table = sp.get('table')
    const user_id = sp.get('user_id')
    const limitRaw = Number(sp.get('limit') || '0')
    const limit = Math.min(200, limitRaw > 0 ? limitRaw : 200)

    const svc = sbService()
    const selectCols = 'id, at, user_id, table_name, action, row_id, details'

    // base query
    let q = svc.from('audit_log').select(selectCols).limit(limit)

    if (table && table !== 'all') q = q.eq('table_name', table)
    if (user_id) q = q.eq('user_id', user_id)

    // order by preferred column "at" first
    let { data, error } = await q.order('at', { ascending: false })

    // fallback if "at" is missing in some envs
    if (error?.code === '42703' /* undefined column */) {
      const selectColsFallback = 'id, created_at, user_id, table_name, action, row_id, details'
      let q2 = svc.from('audit_log').select(selectColsFallback).limit(limit)
      if (table && table !== 'all') q2 = q2.eq('table_name', table)
      if (user_id) q2 = q2.eq('user_id', user_id)
      const r2 = await q2.order('created_at', { ascending: false })
      if (r2.error) return bad('Failed to load audit log', 500)
      // normalize created_at -> at so the UI code stays simple
      data =
        r2.data?.map((r: any) => ({
          id: r.id,
          at: r.created_at,
          user_id: r.user_id,
          table_name: r.table_name,
          action: r.action,
          row_id: r.row_id,
          details: r.details,
        })) ?? []
      return NextResponse.json(data)
    }

    if (error) return bad('Failed to load audit log', 500)
    return NextResponse.json(data ?? [])
  } catch (e: unknown) {
    const msg = (e as { message?: string } | null)?.message
    if (msg === 'unauthorized') return bad('Unauthorized', 401)
    if (msg === 'forbidden') return bad('Forbidden', 403)
    return bad('Failed to load audit log', 500)
  }
}
