import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

  const { data: admin } = await s.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: 'not_admin' }, { status: 403 });

  const { section_id, rows } = await req.json();
  if (!section_id || !Array.isArray(rows)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const clean = rows.map((r: any) => ({
    section_id,
    day: Number(r.day),
    start: String(r.start).slice(0,5),
    end: String(r.end).slice(0,5),
    code: r.code ?? null,
    title: String(r.title ?? '').slice(0,200),
    units: r.units !== undefined && r.units !== '' ? Number(r.units) : null,
    room: r.room ?? null,
    instructor: r.instructor ?? null,
  }));

  for (let i = 0; i < clean.length; i += 500) {
    const batch = clean.slice(i, i + 500);
    const { error } = await s
      .from('classes')
      .upsert(batch, { onConflict: 'section_id,day,start,"end",title', ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
