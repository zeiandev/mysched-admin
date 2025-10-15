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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
  throttle(((req as unknown) as { ip?: string }).ip ?? '0')
    assertSameOrigin(req)
    await requireAdmin()
    const patch = SectionSchema.parse(await req.json())
    const { id } = await context.params
    const idNum = Number(id)
    const sb = sbService()
    const { data, error } = await sb.from('sections').update(patch).eq('id', idNum).select().single()
  if (error) throw new Error('Failed to update section')
    return json(data)
  } catch (e: unknown) {
    const msg = logErr('/api/sections/[id] PATCH', e, { method: req.method })
    await auditError('system', 'sections', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
  throttle(((req as unknown) as { ip?: string }).ip ?? '0')
    assertSameOrigin(req)
    await requireAdmin()
    const { id } = await context.params
    const idNum = Number(id)
    const sb = sbService()
    const { error } = await sb.from('sections').delete().eq('id', idNum)
  if (error) throw new Error('Failed to delete section')
    return json({ ok: true })
  } catch (e: unknown) {
    const msg = logErr('/api/sections/[id] DELETE', e, { method: req.method })
    await auditError('system', 'sections', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}
