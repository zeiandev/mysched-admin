import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  const store = cookies();
  const s = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => store.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) =>
          store.set({ name, value, ...options }),
        remove: (name: string, options: CookieOptions) =>
          store.set({ name, value: '', ...options }),
      },
    }
  );

  await s.auth.signOut();
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL));
}
