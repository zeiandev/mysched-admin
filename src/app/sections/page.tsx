import { requireAdmin } from '@/lib/auth';
import { supaServer } from '@/lib/supabase/server';
import SectionsClient from './sections-client';

export default async function SectionsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) return null;

  const s = supaServer();
  const { data: sections = [] } = await s
    .from('sections')
    .select('id, code')
    .order('id');

  return <SectionsClient initial={sections} />;
}
