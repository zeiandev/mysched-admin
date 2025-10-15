// src/app/api/sections/route.ts
// create index if not exists idx_sections_code on sections(lower(code));

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sbService } from '@/lib/supabase-service'
import { requireAdmin } from '@/lib/authz'
import { assertSameOrigin } from '@/lib/csrf'
import { throttle } from '@/lib/rate'
import { audit, auditError } from '@/lib/audit'
import { logErr } from '@/lib/log'

const SectionSchema = z.object({
  code: z.string().trim().min(1, 'Code is required').max(40, 'Max 40 characters'),
})

function json<T>(data: T, status = 200) {
  const res = NextResponse.json(data, { status })
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'same-origin')
  return res
}

function clientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() || '0'
  return (req as unknown as { ip?: string }).ip ?? '0'
}

export async function GET() {
  try {
    const sb = sbService()
    const { data, error } = await sb.from('sections').select('*').order('id')
    if (error) throw new Error('Failed to load sections')
    return json(data)
  } catch (e) {
    const msg = logErr('/api/sections GET', e, {})
    await auditError('system', 'sections', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    throttle(clientIp(req))
    assertSameOrigin(req)
    const admin = await requireAdmin()

    const input = SectionSchema.parse(await req.json())
    const sb = sbService()

    const { data, error } = await sb.from('sections').insert(input).select().single()
    if (error) throw new Error('Failed to create section')

    await audit(admin.id, 'sections', 'insert', data.id, input)
    return json(data, 201)
  } catch (e) {
    const msg = logErr('/api/sections POST', e, { method: req.method })
    await auditError('system', 'sections', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}

export async function PATCH() {
  return json({ error: 'Use /api/sections/[id] for updates' }, 405)
}
