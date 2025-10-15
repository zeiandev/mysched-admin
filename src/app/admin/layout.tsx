// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { sbService } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Next 15+ requires async cookies
  const store = await cookies()

  // Auth client for user session
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

  const { data } = await sb.auth.getUser()
  const user = data?.user
  if (!user) redirect('/login?reason=unauthorized')

  // Confirm admin user in Supabase “admins” table
  const svc = sbService()
  const { data: row } = await svc
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!row) redirect('/login?reason=forbidden')

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {children}
    </div>
  )
}
