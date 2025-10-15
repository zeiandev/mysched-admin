// src/lib/require-admin.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

type AdminUser = { id: string; email?: string | null }

/** Throws 401/403 if not an authenticated admin. */
export async function requireAdmin(): Promise<AdminUser> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const service = process.env.SUPABASE_SERVICE_ROLE!

  // Next 15: cookies() is async
  const store = await cookies()

  const sb = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value
      },
      set(name: string, value: string, options?: CookieOptions) {
        store.set(name, value, options)
      },
      remove(name: string, options?: CookieOptions) {
        store.set(name, '', { ...(options || {}), maxAge: 0 })
      },
    },
  })

  const { data: u, error } = await sb.auth.getUser()
  if (error || !u?.user) {
    const e: any = new Error('unauthorized')
    e.status = 401
    throw e
  }

  // Service-role check against admins table
  const svc = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: row, error: aerr } = await svc
    .from('admins')
    .select('user_id')
    .eq('user_id', u.user.id)
    .maybeSingle()

  if (aerr || !row) {
    const e: any = new Error('forbidden')
    e.status = 403
    throw e
  }

  return { id: u.user.id, email: (u.user as any).email ?? null }
}
