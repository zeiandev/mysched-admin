'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AdminRow = { user_id: string; email: string; created_at: string };

export default function AdminsClient({ initial }: { initial: AdminRow[] }) {
  const [rows, setRows] = useState<AdminRow[]>(initial);
  const [email, setEmail] = useState('');

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    const cli = supa();
    const { error } = await cli.rpc('add_admin_by_email', { p_email: email.trim() });
    if (error) return alert(error.message);
    // refresh list
    const { data, error: e2 } = await cli.rpc('list_admins');
    if (e2) return alert(e2.message);
    setRows((data ?? []) as AdminRow[]);
    setEmail('');
  }

  async function removeAdmin(user_id: string) {
    if (!confirm('Remove admin?')) return;
    const cli = supa();
    const { error } = await cli.rpc('remove_admin_by_user', { p_user_id: user_id });
    if (error) return alert(error.message);
    setRows(rows.filter(r => r.user_id !== user_id));
  }

  return (
    <main className="p-6 space-y-4 max-w-2xl">
      <h1 className="text-xl font-semibold">Admins</h1>

      <form onSubmit={addAdmin} className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <button className="border rounded px-3">Add</button>
      </form>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Email</th>
            <th className="border p-2">Added</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.user_id}>
              <td className="border p-2">{r.email}</td>
              <td className="border p-2">{new Date(r.created_at).toLocaleString()}</td>
              <td className="border p-2">
                <button className="border rounded px-3" onClick={()=>removeAdmin(r.user_id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
d