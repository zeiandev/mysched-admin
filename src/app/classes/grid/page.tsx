import { requireAdmin } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '../../../lib/supabase/server';
import Nav from '../../../components/Nav';
import GridClient from './grid-client';

type Section = { id:number; code:string };
type DbClass = {
  id:number; section_id:number; day:any; start:string; end:string;
  code:string|null; title:string; room:string|null; instructor:string|null;
};

export default async function GridPage() {
  const gate = await requireAdmin(); if (!gate.ok) redirect('/login');

  const s = supaServer();
  const { data: sections = [] } = await s.from('sections').select('id, code').order('id');

  // preload first section’s classes (optional)
  let initialSectionId: number | null = sections[0]?.id ?? null;
  let initial: any[] = [];
  if (initialSectionId) {
    const { data } = await s
      .from('classes')
      .select('id, section_id, day, start, end, code, title, room, instructor')
      .eq('section_id', initialSectionId)
      .order('day, start, id');
    initial = (data ?? []).map((r: DbClass) => ({ ...r, day: Number(r.day) }));
  }

  return (
    <>
      <Nav />
      <GridClient
        sections={(sections as Section[])}
        initialSectionId={initialSectionId}
        initial={(initial as any[])}
      />
    </>
  );
}
