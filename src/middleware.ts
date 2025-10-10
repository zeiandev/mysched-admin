import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Cookie adapter for Supabase SSR
  const cookiesAdapter = {
    get(name: string) {
      return req.cookies.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      res.cookies.set({ name, value, ...options });
    },
    remove(name: string, options: CookieOptions) {
      res.cookies.set({ name, value: "", ...options });
    },
  };

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuth = Boolean(user);

  const path = req.nextUrl.pathname;
  const isProtected =
    ["/dashboard", "/sections", "/classes", "/admins"].some((x) =>
      path.startsWith(x)
    ) || path === "/api/classes/import";
  const isLogin = path === "/login";

  // redirect unauthenticated users
  if (!isAuth && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // redirect authenticated users away from /login
  if (isAuth && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sections/:path*",
    "/classes/:path*",
    "/admins/:path*",
    "/api/classes/import",
    "/login",
  ],
};
