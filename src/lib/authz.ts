// src/lib/authz.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export interface AdminUser {
  id: string
  email?: string | null
}

/** Enforce signed-in admin, throws 401 or 403. */
export async function requireAdmin(): Promise<AdminUser> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const service = process.env.SUPABASE_SERVICE_ROLE!

  const store = await cookies()

  // Adapter compatible with @supabase/ssr cookies API (handles both variants)
  const cookieAdapter = {
    // deprecated variant
    get(name: string) {
      return store.get(name)?.value
    },
    set(name: string, value: string, options?: CookieOptions) {
      store.set({ name, value, ...(options || {}) })
    },
    remove(name: string, options?: CookieOptions) {
      store.set({ name, value: '', ...(options || {}), maxAge: 0 })
    },
    // new variant
    getAll() {
      return store.getAll().map(c => ({ name: c.name, value: c.value }))
    },
  } as unknown as NonNullable<
    Parameters<typeof createServerClient>[2]
  >['cookies']

  const sb = createServerClient(url, anon, { cookies: cookieAdapter })

  const { data, error } = await sb.auth.getUser()
  if (error || !data?.user) {
    const e = new Error('unauthorized') as Error & { status?: number }
    e.status = 401
    throw e
  }

  const svc = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: row } = await svc
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!row) {
    const e = new Error('forbidden') as Error & { status?: number }
    e.status = 403
    throw e
  }

  return { id: data.user.id, email: data.user.email ?? null }
}
