// create index if not exists idx_classes_section on classes(section_id);
// create index if not exists idx_classes_day on classes(day);
// create index if not exists idx_sections_code on sections(lower(code));
import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase-service'
import { requireAdmin } from '@/lib/authz'
import { assertSameOrigin } from '@/lib/csrf'
import { audit, auditError } from '@/lib/audit'
import { z } from 'zod'
import { throttle } from '@/lib/rate'
import { logErr } from '@/lib/log'

const timeRe = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ClassCreateSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(120, 'Max 120 characters'),
    code: z.string().trim().min(1, 'Code is required').max(20, 'Max 20 characters'),
    section_id: z.coerce.number().int().positive('Section id must be > 0'),
    day: z.coerce.number().int().min(1).max(7).nullable().optional(),
    start: z.string().regex(timeRe, 'Start must be HH:MM'),
    end: z.string().regex(timeRe, 'End must be HH:MM'),
    units: z.coerce.number().int().min(0).max(12).nullable().optional(),
    room: z.string().trim().max(40).nullable().optional(),
    instructor: z.string().trim().max(80).nullable().optional(),
  })
  .refine(({ start, end }) => start < end, { message: 'Start must be before end', path: ['end'] });

function json<T>(data: T, status = 200) {
  const res = NextResponse.json(data, { status })
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'same-origin')
  return res
}

export async function GET(req: NextRequest) {
  try {
    const sb = sbService()
    const sp = new URL(req.url).searchParams
    const section = sp.get('section_id')
    const day = sp.get('day')
    const page = Math.max(1, Number(sp.get('page') || '1') || 1)
    const limitRaw = Number(sp.get('limit') || '0')
    const limit = Math.min(200, limitRaw > 0 ? limitRaw : 100)
    const from = (page - 1) * limit
    const to = from + limit - 1

    let q = sb.from('classes').select('*', { count: 'exact' }).order('id')
    if (section && section !== 'all') q = q.eq('section_id', Number(section))
    if (day && day !== 'all') q = q.eq('day', Number(day))
    q = q.range(from, to)

    const { data, error, count } = await q
  if (error) throw new Error('Failed to load classes')
    return json({ rows: data ?? [], count: count ?? 0, page, limit })
  } catch (e) {
    const msg = logErr('/api/classes GET', e, { method: req.method })
    await auditError('system', 'classes', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}

export async function POST(req: NextRequest) {
  try {
  throttle(((req as unknown) as { ip?: string }).ip ?? '0')
    assertSameOrigin(req)
    const user = await requireAdmin()

    const input = ClassCreateSchema.parse(await req.json())
    const sb = sbService()

    const { data, error } = await sb.from('classes').insert(input).select().single()
  if (error) throw new Error('Failed to create class')

    await audit(user.id, 'classes', 'insert', data.id, input)
    return json(data)
  } catch (e: unknown) {
    const msg = logErr('/api/classes POST', e, { method: req.method })
    await auditError('system', 'classes', msg)
    return json({ error: msg || 'Internal Server Error' }, 500)
  }
}

export async function PATCH() {
  const res = json({ error: 'Use /api/classes/[id] for updates' }, 405)
  return res
}
