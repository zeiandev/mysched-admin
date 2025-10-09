import './globals.css';
import Nav from '@/components/Nav';
import { supaServer } from '@/lib/supabase/server';

export default async function Root({ children }: { children: React.ReactNode }) {
  const s = supaServer();
  const { data: { user } } = await s.auth.getUser();
  const showNav = !!user;            // no nav on /login if not authenticated

  return (
    <html lang="en">
      <body>
        {showNav && <Nav />}
        <div className="p-4">{children}</div>
      </body>
    </html>
  );
}
