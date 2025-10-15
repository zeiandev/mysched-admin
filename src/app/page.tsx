// src/app/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { sbService } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const store = await cookies()

  const sb = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return store.getAll().map((c) => ({ name: c.name, value: c.value }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          store.set(name, value, options)
        })
      },
    },
  })

  const { data } = await sb.auth.getUser()
  const user = data?.user
  if (!user) redirect('/login')

  const svc = sbService()
  const { data: row } = await svc
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!row) redirect('/login?reason=forbidden')

  redirect('/admin')
}
