import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // 1. Jika membuka halaman utama "/" dan sedang login sebagai admin -> langsung masuk ke /admin
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 2. Jika membuka halaman /admin/... (selain /admin/login) tapi belum login -> paksa ke /admin/login
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !token
  ) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};