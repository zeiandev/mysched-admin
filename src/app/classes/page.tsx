import { requireAdmin } from '@/lib/auth';
import { supaServer } from '@/lib/supabase/server';
import ClassesClient from './classes-client';

type Section = { id: number; code: string };
type ClassRow = {
  id: number;
  section_id: number;
  day: string;
  start: string;
  end: string;
  code: string | null;
  title: string;
  units: number | null;
  room: string | null;
  instructor: string | null;
};

export default async function ClassesPage() {
  const gate = await requireAdmin();
  if (!gate.ok) return null;

  const s = supaServer();

  const { data: sectionsData } = await s.from('sections').select('id, code').order('id');
  const sections: Section[] = (sectionsData ?? []) as Section[];
  const activeSectionId = sections[0]?.id ?? null;

  const { data: classesData } = activeSectionId
    ? await s.from('classes')
        .select('id, section_id, day, start, end, code, title, units, room, instructor')
        .eq('section_id', activeSectionId)
        .order('id')
    : { data: [] as ClassRow[] };

  return (
    <ClassesClient
      sections={sections}
      initialSectionId={activeSectionId}
      initialClasses={(classesData ?? []) as ClassRow[]}
    />
  );
}
