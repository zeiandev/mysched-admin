import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase server client (SSR cookies) */
function supaServer() {
  const store = cookies();
  const cookieAdapter = {
    get(name: string) {
      return store.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      store.set({ name, value, ...options } as any);
    },
    remove(name: string, options: CookieOptions) {
      store.set({ name, value: "", ...options } as any);
    },
  };
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter as any }
  );
}

/** Admin check */
export async function requireAdmin() {
  const s = supaServer();

  const { data: { user }, error: userErr } = await s.auth.getUser();
  if (userErr || !user) return { ok: false as const, reason: "unauth" };

  const { data, error: adminErr } = await s
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminErr) {
    console.error("requireAdmin DB error:", adminErr.message);
    return { ok: false as const, reason: "db_error" };
  }
  if (!data) return { ok: false as const, reason: "not_admin" };

  return { ok: true as const, user };
}
