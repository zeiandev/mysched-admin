import { sbServer } from '@/lib/supabase-server'

type SupaUser = {
  id: string
  email?: string | null
  app_metadata?: Record<string, unknown> | null
  user_metadata?: Record<string, unknown> | null
}

export async function getUserAndAdmin(): Promise<{ user: SupaUser | null; isAdmin: boolean }> {
  const sb = await sbServer()

  const { data: u, error: uerr } = await sb.auth.getUser()
  if (uerr || !u?.user) return { user: null, isAdmin: false }
  const user = u.user as SupaUser

  // Check admins table via RLS (user must have a row)
  const { data: row, error } = await sb
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return { user, isAdmin: !!row && !error }
}
