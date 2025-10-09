import { requireAdmin } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '../../../lib/supabase/server';
import Nav from '../../../components/Nav';
import ImportClient from './import-client';

export default async function ImportPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();
  const { data = [] } = await s.from('sections').select('id, code').order('id');

  return (
    <>
      <Nav />
      <ImportClient sections={(data ?? []) as { id: number; code: string }[]} />
    </>
  );
}
