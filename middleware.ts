import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;
  const role = (token?.role as string | undefined)?.toUpperCase();

  // 1. Jika membuka halaman utama "/" saat sudah login sebagai ADMIN atau STAFF
  if (pathname === "/" && token) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (role === "STAFF") {
      return NextResponse.redirect(new URL("/staff", req.url));
    }
  }

  // 2. Proteksi halaman /admin/* (kecuali /admin/login) -> khusus role ADMIN
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role === "STAFF") {
      return NextResponse.redirect(new URL("/staff", req.url));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 3. Proteksi halaman /staff/* (kecuali /staff/login) -> khusus role STAFF
  if (pathname.startsWith("/staff") && !pathname.startsWith("/staff/login")) {
    if (!token) {
      // Arahkan ke /staff/login (atau /admin/login jika memakai 1 pintu login)
      return NextResponse.redirect(new URL("/staff/login", req.url));
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (role !== "STAFF") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 4. Blokir akun STAFF dan ADMIN agar tidak masuk ke halaman reservasi/profil tamu
  if (
    token &&
    (role === "STAFF" || role === "ADMIN") &&
    (pathname.startsWith("/reservasi") || pathname.startsWith("/profil"))
  ) {
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/admin" : "/staff", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/staff/:path*",
    "/reservasi/:path*",
    "/profil/:path*",
  ],
};