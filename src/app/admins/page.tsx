import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import AdminsClient from './admins-client';

type AdminRow = { user_id: string; email: string; created_at: string };

export default async function AdminsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();
  const { data, error } = await s.rpc('list_admins');
  if (error) throw new Error(error.message);

  return (
    <>
      <Nav />
      <AdminsClient initial={(data ?? []) as AdminRow[]} />
    </>
  );
}
