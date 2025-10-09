import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '../../lib/supabase/server';
import Nav from '../../components/Nav';
import AuditClient from './audit-client';

export default async function AuditPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();
  const { data, error } = await s.rpc('list_audit', { p_limit: 200 });
  if (error) throw new Error(error.message);

  return (
    <>
      <Nav />
      <AuditClient initial={(data ?? []) as any[]} />
    </>
  );
}
