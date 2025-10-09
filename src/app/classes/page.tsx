import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import ClassesClient from './classes-client';

type Section = { id: number; code: string };
type DbClass = {
  id: number;
  section_id: number;
  day: any;
  start: string;
  end: string;
  code: string | null;
  title: string;
  units: any;
  room: string | null;
  instructor: string | null;
};

export default async function ClassesPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();

  const { data: sectionsData } = await s
    .from('sections')
    .select('id, code')
    .order('id');

  const sections: Section[] = (sectionsData ?? []) as Section[];
  const activeSectionId = sections[0]?.id ?? null;

  let classesClean: any[] = [];
  if (activeSectionId) {
    const { data } = await s
      .from('classes')
      .select(
        'id, section_id, day, start, end, code, title, units, room, instructor'
      )
      .eq('section_id', activeSectionId)
      .order('id');

    const raw = (data ?? []) as DbClass[];
    classesClean = raw.map((r) => ({
      ...r,
      day: Number(r.day),
      units:
        r.units === null || r.units === undefined || r.units === ''
          ? null
          : Number(r.units),
    }));
  }

  return (
    <>
      <Nav />
      <ClassesClient
        sections={sections}
        initialSectionId={activeSectionId}
        initialClasses={classesClean}
      />
    </>
  );
}
