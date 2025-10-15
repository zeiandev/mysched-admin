import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase-service'
import { requireAdmin } from '@/lib/authz'
import { assertSameOrigin } from '@/lib/csrf'
import { audit, auditError } from '@/lib/audit'
import { z } from 'zod'
import { throttle } from '@/lib/rate'
import { logErr } from '@/lib/log'

const timeRe = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ClassPatchSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(120).optional(),
    code: z.string().trim().min(1, 'Code is required').max(20).optional(),
    section_id: z.coerce.number().int().positive('Section id must be > 0').optional(),
    day: z.coerce.number().int().min(1).max(7).nullable().optional(),
    start: z.string().regex(timeRe, 'Start must be HH:MM').optional(),
    end: z.string().regex(timeRe, 'End must be HH:MM').optional(),
    units: z.coerce.number().int().min(0).max(12).nullable().optional(),
    room: z.string().trim().max(40).nullable().optional(),
    instructor: z.string().trim().max(80).nullable().optional(),
  })
  .refine(d => Object.keys(d).length > 0, { message: 'Nothing to update' })
  .refine(d => (d.start && d.end ? d.start < d.end : true), {
    message: 'Start must be before end',
    path: ['end'],
  });

function json<T>(data: T, status = 200) {
  const res = NextResponse.json(data, { status })
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'same-origin')
  return res
}

type P = { id: string };

export async function PATCH(req: NextRequest, context: { params: Promise<P> }) {
  try {
  throttle(((req as unknown) as { ip?: string }).ip ?? '0')
    assertSameOrigin(req)
    const user = await requireAdmin()
    const { id } = await context.params
    const idNum = Number(id)
    const patch = ClassPatchSchema.parse(await req.json())

    const sb = sbService()
    const { data, error } = await sb.from('classes').update(patch).eq('id', idNum).select().single()
  if (error) throw new Error('Failed to update class')
    await audit(user.id, 'classes', 'update', idNum, patch)
    return json(data)
  } catch (e: unknown) {
    const msg = logErr('/api/classes/[id] PATCH', e, { method: req.method })
    await auditError('system', 'classes', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<P> }) {
  try {
  throttle(((req as unknown) as { ip?: string }).ip ?? '0')
    assertSameOrigin(req)
    const user = await requireAdmin()
    const { id } = await context.params
    const idNum = Number(id)
    const sb = sbService()
    const { error } = await sb.from('classes').delete().eq('id', idNum)
  if (error) throw new Error('Failed to delete class')
    await audit(user.id, 'classes', 'delete', idNum)
    return json({ ok: true })
  } catch (e: unknown) {
    const msg = logErr('/api/classes/[id] DELETE', e, { method: req.method })
    await auditError('system', 'classes', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}
