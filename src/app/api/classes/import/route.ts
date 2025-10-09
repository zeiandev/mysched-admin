import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function ssc() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => store.get(n)?.value,
        set: (n: string, v: string, o: CookieOptions) => store.set({ name: n, value: v, ...o } as any),
        remove: (n: string, o: CookieOptions) => store.set({ name: n, value: '', ...o } as any),
      },
    }
  );
}

export async function POST(req: Request) {
  const s = ssc();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const { data: isAdmin } = await s.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!isAdmin) return NextResponse.json({ error: 'not_admin' }, { status: 403 });

  const body = await req.json();
  const section_id: number = body.section_id;
  const rows: any[] = body.rows ?? [];

  if (!section_id || !Array.isArray(rows)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  // sanitize + coerce
  const clean = rows.map(r => ({
    section_id,
    day: Number(r.day),
    start: String(r.start).slice(0,5),
    end: String(r.end).slice(0,5),
    code: r.code ?? null,
    title: String(r.title ?? '').slice(0, 200),
    units: r.units != null && r.units !== '' ? Number(r.units) : null,
    room: r.room ?? null,
    instructor: r.instructor ?? null,
  }));

  // chunk insert to avoid payload limits
  const chunk = 500;
  for (let i = 0; i < clean.length; i += chunk) {
    const batch = clean.slice(i, i + chunk);
    const { error } = await s
      .from('classes')
      .upsert(batch, { onConflict: 'section_id,day,start,"end",title', ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
