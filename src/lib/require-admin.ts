import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

interface AdminUser {
  id: string
  email?: string | null
}

/** Throws 401/403 if not an authenticated admin. */
export async function requireAdmin(): Promise<AdminUser> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const service = process.env.SUPABASE_SERVICE_ROLE!

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
    const err = new Error('unauthorized') as Error & { status?: number }
    err.status = 401
    throw err
  }

  const svc = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: row, error: aerr } = await svc
    .from('admins')
    .select('user_id')
    .eq('user_id', u.user.id)
    .maybeSingle()

  if (aerr || !row) {
    const err = new Error('forbidden') as Error & { status?: number }
    err.status = 403
    throw err
  }

  return { id: u.user.id, email: u.user.email ?? null }
}
