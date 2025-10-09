'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Section = { id: number; code: string };

export default function SectionsClient({ initial }: { initial: Section[] }) {
  const [rows, setRows] = useState<Section[]>(initial);
  const [code, setCode] = useState('');

  async function createSection(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const { data, error } = await supa()
      .from('sections')
      .insert({ code })
      .select('id, code')
      .single();
    if (error) return alert(error.message);
    setRows([...rows, data!]);
    setCode('');
  }

  async function updateSection(id: number, code: string) {
    const { error } = await supa().from('sections').update({ code }).eq('id', id);
    if (error) alert(error.message);
  }

  async function deleteSection(id: number) {
    if (!confirm('Delete section?')) return;
    const { error } = await supa().from('sections').delete().eq('id', id);
    if (error) return alert(error.message);
    setRows(rows.filter(r => r.id !== id));
  }

  return (
    <main className="max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-semibold">Sections</h1>

      <form onSubmit={createSection} className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="e.g., BSCS-2A-2025"
          value={code}
          onChange={e=>setCode(e.target.value)}
        />
        <button className="border rounded px-3">Add</button>
      </form>

      <ul className="divide-y">
        {rows.map(r => (
          <li key={r.id} className="flex items-center gap-2 py-2">
            <input
              className="border rounded p-2 flex-1"
              defaultValue={r.code}
              onBlur={e => updateSection(r.id, e.currentTarget.value)}
            />
            <button className="border rounded px-3" onClick={() => deleteSection(r.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
