import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin'; // SERVER-ONLY client (service role)

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

function supaForAuth() {
  const store = cookies();
  const cookieAdapter = {
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
    { cookies: cookieAdapter as any }
  );
}

export async function POST(req: Request) {
  // 1) Authn + admin gate using session
  const s = supaForAuth();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, code: 'UNAUTH' }, { status: 401 });

  const { data: admin, error: adminErr } = await s
    .from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (adminErr) return NextResponse.json({ ok: false, code: 'ADMIN_CHECK_FAILED', error: adminErr.message }, { status: 500 });
  if (!admin) return NextResponse.json({ ok: false, code: 'FORBIDDEN' }, { status: 403 });

  // 2) Validate payload
  let parsed: z.infer<typeof payloadSchema>;
  try {
    parsed = payloadSchema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ ok: false, code: 'BAD_REQUEST', error: e?.issues ?? String(e) }, { status: 400 });
  }

  const { section_id, rows } = parsed;

  // 3) Normalize + guard times
  let clean;
  try {
    clean = rows.map((r) => {
      const start = String(r.start).slice(0, 5);
      const end = String(r.end).slice(0, 5);
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
  } catch (e: any) {
    return NextResponse.json({ ok: false, code: 'TIME_RANGE_INVALID', error: String(e?.message || e) }, { status: 400 });
  }

  // 4) Write using SERVICE ROLE (bypasses RLS, safer for admin backend)
  try {
    for (let i = 0; i < clean.length; i += 500) {
      const batch = clean.slice(i, i + 500);
      const { error } = await supabaseAdmin
        .from('classes')
        .upsert(batch, { onConflict: 'section_id,day,start,"end",title', ignoreDuplicates: true });
      if (error) return NextResponse.json({ ok: false, code: 'UPSERT_FAILED', error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR', error: String(e?.message || e) }, { status: 500 });
  }
}
