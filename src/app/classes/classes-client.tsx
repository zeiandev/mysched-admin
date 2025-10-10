'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestError } from '@supabase/supabase-js';

const supa = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

type Section = { id: number; code: string };
type ClassRow = {
  id: number;
  section_id: number;
  day: number;
  start: string;
  end: string;
  code: string | null;
  title: string;
  units: number | null;
  room: string | null;
  instructor: string | null;
};

export default function ClassesClient({
  sections,
  initialSectionId,
  initialClasses,
}: {
  sections: Section[];
  initialSectionId: number | null;
  initialClasses: ClassRow[];
}) {
  const [sectionId, setSectionId] = useState<number | null>(initialSectionId);
  const [rows, setRows] = useState<ClassRow[]>(initialClasses);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Omit<ClassRow, 'id'>>({
    section_id: initialSectionId ?? 0,
    day: 0,
    start: '',
    end: '',
    code: '',
    title: '',
    units: null,
    room: '',
    instructor: '',
  });
  const [loading, setLoading] = useState(false);

  // filter list
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.title, r.code ?? '', r.room ?? '', r.instructor ?? '']
        .some((v) => v.toLowerCase().includes(s))
    );
  }, [rows, q]);

  useEffect(() => {
    if (!sectionId) return;
    setForm((f) => ({ ...f, section_id: sectionId }));
    (async () => {
      setLoading(true);
      const { data, error } = await supa()
        .from('classes')
        .select(
          'id, section_id, day, start, end, code, title, units, room, instructor'
        )
        .eq('section_id', sectionId)
        .order('id');
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      const cleaned = (data ?? []).map((r: any) => ({
        ...r,
        day: Number(r.day),
        units: r.units == null ? null : Number(r.units),
      })) as ClassRow[];
      setRows(cleaned);
      setLoading(false);
    })();
  }, [sectionId]);

  // export to CSV
  function toCSV(list: ClassRow[]) {
    const head = 'day,start,end,code,title,units,room,instructor';
    const body = list
      .map((r) =>
        [
          r.day,
          r.start,
          r.end,
          r.code ?? '',
          r.title,
          r.units ?? '',
          r.room ?? '',
          r.instructor ?? '',
        ].join(',')
      )
      .join('\n');
    return head + '\n' + body;
  }

  function downloadCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'classes.csv',
    });
    a.click();
  }

  // add class
  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    if (!sectionId) return alert('Pick a section first');
    if (!(form.day >= 1 && form.day <= 7)) return alert('Day must be 1–7');
    if (!form.start || !form.end) return alert('Times required');
    if (!form.title.trim()) return alert('Title required');

    const payload = [{ ...form, section_id: sectionId }];
    const { data, error } = await supa()
      .from('classes')
      .insert(payload)
      .select(
        'id, section_id, day, start, end, code, title, units, room, instructor'
      )
      .single();

    if (error) {
      if ((error as PostgrestError).code === '23505')
        return alert('Duplicate class for same section/day/time/title');
      return alert(error.message);
    }

    const d = data as any as ClassRow;
    d.day = Number(d.day);
    d.units = d.units == null ? null : Number(d.units);

    setRows([...rows, d]);
    setForm({
      ...form,
      day: 0,
      start: '',
      end: '',
      code: '',
      title: '',
      units: null,
      room: '',
      instructor: '',
    });
  }

  // update & delete
  async function updateField(id: number, patch: Partial<ClassRow>) {
    const { error } = await supa().from('classes').update(patch).eq('id', id);
    if (error) alert(error.message);
  }

  async function deleteClass(id: number) {
    if (!confirm('Delete class?')) return;
    const { error } = await supa().from('classes').delete().eq('id', id);
    if (error) return alert(error.message);
    setRows(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium">Section:</span>
        <select
          className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-400"
          value={sectionId ?? ''}
          onChange={(e) => setSectionId(Number(e.target.value))}
        >
          {sectionId == null && <option value="">Select section</option>}
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code}
            </option>
          ))}
        </select>

        <input
          className="rounded-md border border-gray-300 px-3 py-1 text-sm outline-none focus:border-gray-400 flex-1 min-w-[220px]"
          placeholder="Search title, code, room, instructor"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={downloadCSV}
        >
          Export CSV
        </button>
      </div>

      <form
        onSubmit={createClass}
        className="grid grid-cols-8 gap-2 text-sm bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <select
          className="border p-2 rounded col-span-1"
          value={form.day || ''}
          onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
        >
          <option value="">Day</option>
          <option value="1">Mon</option>
          <option value="2">Tue</option>
          <option value="3">Wed</option>
          <option value="4">Thu</option>
          <option value="5">Fri</option>
          <option value="6">Sat</option>
          <option value="7">Sun</option>
        </select>
        <input
          type="time"
          className="border p-2 rounded col-span-1"
          value={form.start}
          onChange={(e) => setForm({ ...form, start: e.target.value })}
        />
        <input
          type="time"
          className="border p-2 rounded col-span-1"
          value={form.end}
          onChange={(e) => setForm({ ...form, end: e.target.value })}
        />
        <input
          className="border p-2 rounded col-span-1"
          placeholder="Code"
          value={form.code ?? ''}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <input
          className="border p-2 rounded col-span-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="number"
          className="border p-2 rounded col-span-1"
          placeholder="Units"
          value={form.units ?? ''}
          onChange={(e) => setForm({ ...form, units: Number(e.target.value) })}
        />
        <input
          className="border p-2 rounded col-span-1"
          placeholder="Room"
          value={form.room ?? ''}
          onChange={(e) => setForm({ ...form, room: e.target.value })}
        />
        <input
          className="border p-2 rounded col-span-2"
          placeholder="Instructor"
          value={form.instructor ?? ''}
          onChange={(e) => setForm({ ...form, instructor: e.target.value })}
        />
        <button className="border rounded px-3 bg-white hover:bg-gray-50 col-span-1">
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading classes...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-2 text-left border">Day</th>
                <th className="p-2 text-left border">Start</th>
                <th className="p-2 text-left border">End</th>
                <th className="p-2 text-left border">Code</th>
                <th className="p-2 text-left border">Title</th>
                <th className="p-2 text-left border">Units</th>
                <th className="p-2 text-left border">Room</th>
                <th className="p-2 text-left border">Instructor</th>
                <th className="p-2 text-left border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="border p-1">
                    <input
                      className="w-14 border rounded px-1"
                      defaultValue={String(r.day)}
                      onBlur={(e) =>
                        updateField(r.id, { day: Number(e.currentTarget.value) })
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="time"
                      className="border rounded px-1"
                      defaultValue={r.start}
                      onBlur={(e) =>
                        updateField(r.id, { start: e.currentTarget.value })
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="time"
                      className="border rounded px-1"
                      defaultValue={r.end}
                      onBlur={(e) =>
                        updateField(r.id, { end: e.currentTarget.value })
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      className="border rounded px-1 w-20"
                      defaultValue={r.code ?? ''}
                      onBlur={(e) =>
                        updateField(r.id, { code: e.currentTarget.value })
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      className="border rounded px-1 w-64"
                      defaultValue={r.title}
                      onBlur={(e) =>
                        updateField(r.id, { title: e.currentTarget.value })
                      }
                    />
                  </td>
                  <td className="border p-1 w-14">
                    <input
                      type="number"
                      className="border rounded px-1 w-14"
                      defaultValue={r.units ?? 0}
                      onBlur={(e) =>
                        updateField(r.id, {
                          units: Number(e.currentTarget.value),
                        })
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      className="border rounded px-1 w-24"
                      defaultValue={r.room ?? ''}
                      onBlur={(e) =>
                        updateField(r.id, { room: e.currentTarget.value })
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      className="border rounded px-1 w-40"
                      defaultValue={r.instructor ?? ''}
                      onBlur={(e) =>
                        updateField(r.id, { instructor: e.currentTarget.value })
                      }
                    />
                  </td>
                  <td className="border p-1 text-center">
                    <button
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
                      onClick={() => deleteClass(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
