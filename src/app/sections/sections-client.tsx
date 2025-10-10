'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestError } from '@supabase/supabase-js';

const supa = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

type Section = { id: number; code: string };

export default function SectionsClient({ initial }: { initial: Section[] }) {
  const [rows, setRows] = useState<Section[]>(initial);
  const [code, setCode] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function createSection(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim();
    if (!value) return;

    setAdding(true);
    const { data, error } = await supa()
      .from('sections')
      .insert({ code: value })
      .select('id, code')
      .single();

    setAdding(false);

    if (error) {
      if ((error as PostgrestError).code === '23505') return alert('Section code already exists');
      return alert(error.message);
    }

    setRows((r) => [...r, data as Section]);
    setCode('');
  }

  async function updateSection(id: number, nextCodeRaw: string) {
    const nextCode = nextCodeRaw.trim();
    if (!nextCode) return; // ignore empty blur
    const prev = rows.find((r) => r.id === id)?.code ?? '';

    if (nextCode === prev) return;

    const { error } = await supa().from('sections').update({ code: nextCode }).eq('id', id);
    if (error) {
      if ((error as PostgrestError).code === '23505') return alert('Section code already exists');
      alert(error.message);
      return;
    }
    // reflect change locally
    setRows((r) => r.map((x) => (x.id === id ? { ...x, code: nextCode } : x)));
  }

  async function deleteSection(id: number) {
    if (!confirm('Delete section and its classes?')) return;
    setDeletingId(id);
    const { error } = await supa().from('sections').delete().eq('id', id);
    setDeletingId(null);
    if (error) return alert(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sections</h2>
        <a href="/classes" className="text-sm text-[#0A2B52] hover:underline">Go to Classes</a>
      </div>

      <form onSubmit={createSection} className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
          placeholder="e.g., BSCS-2A-2025"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-2 text-left border">Code</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border p-2">
                  <input
                    className="w-full rounded border border-gray-300 px-2 py-1 outline-none focus:border-gray-400"
                    defaultValue={r.code}
                    onBlur={(e) => updateSection(r.id, e.currentTarget.value)}
                  />
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => deleteSection(r.id)}
                    disabled={deletingId === r.id}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
                  >
                    {deletingId === r.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-gray-500 py-6 text-sm">
                  No sections yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
