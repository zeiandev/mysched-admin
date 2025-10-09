'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supa().auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = '/dashboard';
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold">Admin login</h1>
        <input className="w-full border p-2 rounded" type="email" placeholder="email"
               value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input className="w-full border p-2 rounded" type="password" placeholder="password"
               value={password} onChange={e=>setPassword(e.target.value)} required/>
        <button className="w-full border p-2 rounded">Sign in</button>
      </form>
    </main>
  );
}
