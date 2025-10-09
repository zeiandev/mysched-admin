import { notFound } from 'next/navigation';
import { supaServer } from '../../../lib/supabase/server';
import ViewGridClient from './view-grid-client';

type Section = { id:number; code:string };
type DbClass = {
  id:number; section_id:number; day:any; start:string; end:string;
  code:string|null; title:string; room:string|null; instructor:string|null;
};

export default async function SectionView({ params }: { params:{ code:string } }) {
  const s = supaServer();

  // find section by code (case-insensitive)
  const { data: sec } = await s
    .from('sections')
    .select('id, code')
    .ilike('code', params.code)
    .maybeSingle();

  if (!sec) notFound();

  const section = sec as Section;

  const { data } = await s
    .from('classes')
    .select('id, section_id, day, start, end, code, title, room, instructor')
    .eq('section_id', section.id)
    .order('day, start, id');

  const rows = (data ?? []).map((r: DbClass) => ({
    id: r.id,
    section_id: r.section_id,
    day: Number(r.day),
    start: r.start,
    end: r.end,
    title: r.title,
    code: r.code,
    room: r.room,
    instructor: r.instructor,
  }));

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Timetable — {section.code}</h1>
      <ViewGridClient initial={rows} />
      <a className="underline text-sm" href="/view">All sections</a>
    </main>
  );
}
