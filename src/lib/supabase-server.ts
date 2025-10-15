import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const sbServer = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      'Missing SUPABASE env. Require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  const store = await cookies()

  const cookieAdapter = {
    get: (name: string) => store.get(name)?.value,
    getAll: () => store.getAll().map(c => ({ name: c.name, value: c.value })),
    set: (name: string, value: string, options?: CookieOptions) => {
      // next/headers cookies.set expects { name, value, ...opts }
      store.set({ name, value, ...(options || {}) })
    },
    remove: (name: string, options?: CookieOptions) => {
      store.set({ name, value: '', ...(options || {}) })
    },
  }

  return createServerClient(url, anon, { cookies: cookieAdapter })
}
