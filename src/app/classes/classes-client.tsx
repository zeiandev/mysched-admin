'use client';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export default function ClassesClient({
  sections, initialSectionId, initialClasses
}: {
  sections: Section[];
  initialSectionId: number | null;
  initialClasses: ClassRow[];
}) {
  const [sectionId, setSectionId] = useState<number | null>(initialSectionId);
  const [rows, setRows] = useState<ClassRow[]>(initialClasses);
  const [form, setForm] = useState<Omit<ClassRow, 'id'>>({
    section_id: initialSectionId ?? 0,
    day: '',
    start: '',
    end: '',
    code: '',
    title: '',
    units: 0,
    room: '',
    instructor: '',
  });

  // load when section changes
  useEffect(() => {
    if (!sectionId) return;
    setForm(f => ({ ...f, section_id: sectionId }));
    (async () => {
      const { data, error } = await supa()
        .from('classes')
        .select('id, section_id, day, start, end, code, title, units, room, instructor')
        .eq('section_id', sectionId)
        .order('id');
      if (error) return alert(error.message);
      setRows((data ?? []) as ClassRow[]);
    })();
  }, [sectionId]);

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    if (!sectionId) return alert('Pick a section first');
    if (!form.title || !form.day || !form.start || !form.end) return alert('Missing required fields');
    const { data, error } = await supa()
      .from('classes')
      .insert([{ ...form, section_id: sectionId }])
      .select('id, section_id, day, start, end, code, title, units, room, instructor')
      .single();
    if (error) return alert(error.message);
    setRows([...rows, data as ClassRow]);
    // reset minimal
    setForm(f => ({ ...f, day: '', start: '', end: '', code: '', title: '', units: 0, room: '', instructor: '' }));
  }

  async function updateField(id: number, patch: Partial<ClassRow>) {
    const { error } = await supa().from('classes').update(patch).eq('id', id);
    if (error) alert(error.message);
  }

  async function deleteClass(id: number) {
    if (!confirm('Delete class?')) return;
    const { error } = await supa().from('classes').delete().eq('id', id);
    if (error) return alert(error.message);
    setRows(rows.filter(r => r.id !== id));
  }

  const sectionOptions = useMemo(
    () => sections.map(s => <option key={s.id} value={s.id}>{s.code}</option>),
    [sections]
  );

  return (
    <main className="p-6 space-y-4 max-w-5xl">
      <h1 className="text-xl font-semibold">Classes</h1>

      <div className="flex gap-2 items-center">
        <span>Section:</span>
        <select
          className="border rounded p-2"
          value={sectionId ?? ''}
          onChange={e => setSectionId(Number(e.target.value))}
        >
          {sectionId == null && <option value="">Select section</option>}
          {sectionOptions}
        </select>
      </div>

      <form onSubmit={createClass} className="grid grid-cols-8 gap-2 items-center">
        <input className="border p-2 rounded col-span-1" placeholder="Day (1-7 or Mon)" value={form.day}
          onChange={e=>setForm({...form, day: e.target.value})}/>
        <input className="border p-2 rounded col-span-1" placeholder="Start (e.g., 08:00)" value={form.start}
          onChange={e=>setForm({...form, start: e.target.value})}/>
        <input className="border p-2 rounded col-span-1" placeholder="End (e.g., 09:30)" value={form.end}
          onChange={e=>setForm({...form, end: e.target.value})}/>
        <input className="border p-2 rounded col-span-1" placeholder="Code" value={form.code ?? ''}
          onChange={e=>setForm({...form, code: e.target.value})}/>
        <input className="border p-2 rounded col-span-2" placeholder="Title" value={form.title}
          onChange={e=>setForm({...form, title: e.target.value})} required/>
        <input className="border p-2 rounded col-span-1" placeholder="Units" type="number" value={form.units ?? 0}
          onChange={e=>setForm({...form, units: Number(e.target.value)})}/>
        <input className="border p-2 rounded col-span-1" placeholder="Room" value={form.room ?? ''}
          onChange={e=>setForm({...form, room: e.target.value})}/>
        <input className="border p-2 rounded col-span-2" placeholder="Instructor" value={form.instructor ?? ''}
          onChange={e=>setForm({...form, instructor: e.target.value})}/>
        <button className="border rounded px-3 col-span-1">Add</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border p-2">Day</th>
              <th className="border p-2">Start</th>
              <th className="border p-2">End</th>
              <th className="border p-2">Code</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Units</th>
              <th className="border p-2">Room</th>
              <th className="border p-2">Instructor</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="border p-1">
                  <input className="w-24 border p-1 rounded" defaultValue={r.day}
                    onBlur={e=>updateField(r.id, { day: e.currentTarget.value })}/>
                </td>
                <td className="border p-1">
                  <input className="w-24 border p-1 rounded" defaultValue={r.start}
                    onBlur={e=>updateField(r.id, { start: e.currentTarget.value })}/>
                </td>
                <td className="border p-1">
                  <input className="w-24 border p-1 rounded" defaultValue={r.end}
                    onBlur={e=>updateField(r.id, { end: e.currentTarget.value })}/>
                </td>
                <td className="border p-1">
                  <input className="w-24 border p-1 rounded" defaultValue={r.code ?? ''}
                    onBlur={e=>updateField(r.id, { code: e.currentTarget.value })}/>
                </td>
                <td className="border p-1">
                  <input className="w-64 border p-1 rounded" defaultValue={r.title}
                    onBlur={e=>updateField(r.id, { title: e.currentTarget.value })}/>
                </td>
                <td className="border p-1">
                  <input className="w-16 border p-1 rounded" type="number" defaultValue={r.units ?? 0}
                    onBlur={e=>updateField(r.id, { units: Number(e.currentTarget.value) })}/>
                </td>
                <td className="border p-1">
                  <input className="w-24 border p-1 rounded" defaultValue={r.room ?? ''}
                    onBlur={e=>updateField(r.id, { room: e.currentTarget.value })}/>
                </td>
                <td className="border p-1">
                  <input className="w-40 border p-1 rounded" defaultValue={r.instructor ?? ''}
                    onBlur={e=>updateField(r.id, { instructor: e.currentTarget.value })}/>
                </td>
                <td className="border p-1">
                  <button className="border rounded px-2" onClick={()=>deleteClass(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
