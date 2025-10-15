import { getUserAndAdmin } from '@/lib/is-admin';
import type { User } from '@supabase/supabase-js';

export async function requireAdmin(): Promise<User> {
  const { user, isAdmin } = await getUserAndAdmin();
  if (!user) throw new Error('unauthorized');
  if (!isAdmin) throw new Error('forbidden');
  return user as unknown as User;
}
