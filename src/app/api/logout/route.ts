import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST() {
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

  const s = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );

  await s.auth.signOut();
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL));
}
