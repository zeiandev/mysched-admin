'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

type AdminRow = { user_id: string; email: string; created_at: string };

export default function AdminsClient({ initial }: { initial: AdminRow[] }) {
  const [rows, setRows] = useState<AdminRow[]>(initial);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const cli = supa();
    const { error } = await cli.rpc('add_admin_by_email', { p_email: email.trim() });
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    const { data, error: e2 } = await cli.rpc('list_admins');
    if (e2) alert(e2.message);
    else setRows((data ?? []) as AdminRow[]);
    setEmail('');
    setLoading(false);
  }

  async function removeAdmin(user_id: string) {
    if (!confirm('Remove admin?')) return;
    const cli = supa();
    const { error } = await cli.rpc('remove_admin_by_user', { p_user_id: user_id });
    if (error) return alert(error.message);
    setRows(rows.filter((r) => r.user_id !== user_id));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="text-xl font-semibold mb-6">Administrators</h2>

      <form onSubmit={addAdmin} className="mb-6 flex gap-2">
        <input
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add Admin'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Added</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user_id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => removeAdmin(r.user_id)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
