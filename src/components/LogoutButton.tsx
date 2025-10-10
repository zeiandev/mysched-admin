'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const supa = () =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

  async function handleLogout() {
    try {
      setLoading(true);
      await supa().auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Error logging out. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md bg-[#0A2B52] text-white text-sm font-medium px-4 py-2 shadow-sm hover:opacity-90 disabled:opacity-50 active:scale-[.98] transition"
    >
      {loading ? 'Logging out…' : 'Logout'}
    </button>
  );
}
