import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase-service'
import { requireAdmin } from '@/lib/authz'
import { assertSameOrigin } from '@/lib/csrf'
import { z } from 'zod'
import { throttle } from '@/lib/rate'
import { auditError } from '@/lib/audit'
import { logErr } from '@/lib/log'

const SectionSchema = z.object({
  code: z.string().trim().min(1, 'Code is required').max(40, 'Max 40 characters'),
});

function json<T>(data: T, status = 200) {
  const res = NextResponse.json(data, { status })
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'same-origin')
  return res
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
  throttle(((req as unknown) as { ip?: string }).ip ?? '0')
    assertSameOrigin(req)
    await requireAdmin()
    const input = SectionSchema.parse(await req.json())
    const sb = sbService()
    const { data, error } = await sb.from('sections').insert(input).select().single()
  if (error) throw new Error('Failed to create section')
    return json(data)
  } catch (e: unknown) {
    const msg = logErr('/api/sections POST', e, { method: req.method })
    await auditError('system', 'sections', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}
