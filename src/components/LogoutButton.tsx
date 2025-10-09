'use client';

import { createBrowserClient } from '@supabase/ssr';

export default function LogoutButton() {
  const supa = () =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

  async function onClick() {
    await supa().auth.signOut();
    window.location.href = '/login';
  }

  return (
    <button
      onClick={onClick}
      className="rounded-lg px-4 py-2 text-[14px] font-medium bg-[#0A2B52] text-white hover:opacity-90 active:scale-[.98] transition"
    >
      Logout
    </button>
  );
}
