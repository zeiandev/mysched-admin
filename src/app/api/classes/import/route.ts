import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const rowSchema = z.object({
  day: z.coerce.number().int().min(1).max(7),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  code: z.string().max(64).nullable().optional(),
  title: z.string().min(1).max(200),
  units: z.coerce.number().int().min(0).max(20).nullable().optional(),
  room: z.string().max(64).nullable().optional(),
  instructor: z.string().max(128).nullable().optional(),
});

const payloadSchema = z.object({
  section_id: z.coerce.number().int().positive(),
  rows: z.array(rowSchema).max(2000),
});

function supa() {
  const store = cookies();
  const cookieAdapter: any = {
    get(name: string) { return store.get(name)?.value; },
    set(name: string, value: string, options: CookieOptions) {
      store.set({ name, value, ...options } as any);
    },
    remove(name: string, options: CookieOptions) {
      store.set({ name, value: '', ...options } as any);
    },
  };
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );
}

export async function POST(req: Request) {
  const s = supa();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const { data: admin } = await s
    .from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: 'not_admin' }, { status: 403 });

  const body = await req.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { section_id, rows } = parsed.data;

  // Normalize + guard time ordering
  const clean = rows.map((r) => {
    const start = String(r.start).slice(0,5);
    const end = String(r.end).slice(0,5);
    if (!(start < end)) throw new Error('start must be < end');
    return {
      section_id,
      day: r.day,
      start,
      end,
      code: r.code ?? null,
      title: r.title,
      units: r.units ?? null,
      room: r.room ?? null,
      instructor: r.instructor ?? null,
    };
  });

  try {
    for (let i = 0; i < clean.length; i += 500) {
      const batch = clean.slice(i, i + 500);
      const { error } = await s
        .from('classes')
        .upsert(batch, { onConflict: 'section_id,day,start,"end",title', ignoreDuplicates: true });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 400 });
  }
}
