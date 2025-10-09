import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '@/lib/supabase/server';
import SectionsClient from './sections-client';

type Section = { id: number; code: string };

export default async function SectionsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();
  const { data } = await s.from('sections').select('id, code').order('id');
  const sections: Section[] = (data ?? []) as Section[];
  return <SectionsClient initial={sections} />;
}
