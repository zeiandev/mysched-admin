import { requireAdmin } from '../../../lib/auth';
import { supaServer } from '../../../lib/supabase/server';
import Nav from '../../../components/Nav';
import { redirect } from 'next/navigation';
import ImportClient from './import-client';

export default async function ImportPage() {
  const gate = await requireAdmin(); if (!gate.ok) redirect('/login');
  const s = supaServer();
  const { data: sections = [] } = await s.from('sections').select('id, code').order('id');
  return (<>
    <Nav />
    <ImportClient sections={(sections ?? []) as {id:number; code:string}[]} />
  </>);
}
