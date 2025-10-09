import { supaServer } from '@/lib/supabase/server';
export async function requireAdmin() {
  const s = supaServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return { ok: false as const, reason: 'unauth' };
  const { data } = await s.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!data) return { ok: false as const, reason: 'not_admin' };
  return { ok: true as const, user };
}
