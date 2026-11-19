"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      data-global-navbar="true"
      className="bg-white border-b border-stone-200/80 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 border border-[#C6A267] text-[#0F2334] flex items-center justify-center font-serif font-bold text-lg">
            N
          </div>
          <div className="leading-none">
            <span className="block font-bold tracking-[0.16em] text-xs text-[#0F2334]">
              NESTRA
            </span>
            <span className="text-[9px] tracking-[0.22em] text-stone-500">
              HOTEL
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-stone-600">
          <Link
            href="/"
            className={
              pathname === "/"
                ? "text-[#0F2334] font-semibold"
                : "hover:text-[#0F2334]"
            }
          >
            Beranda
          </Link>
          <Link
            href="/kamar"
            className={
              pathname?.startsWith("/kamar")
                ? "text-[#0F2334] font-semibold"
                : "hover:text-[#0F2334]"
            }
          >
            Kamar
          </Link>
          <Link
            href="/fasilitas"
            className={
              pathname === "/fasilitas"
                ? "text-[#0F2334] font-semibold"
                : "hover:text-[#0F2334]"
            }
          >
            Fasilitas &amp; pengalaman
          </Link>
          <Link
            href="/penawaran"
            className={
              pathname === "/penawaran"
                ? "text-[#0F2334] font-semibold"
                : "hover:text-[#0F2334]"
            }
          >
            Penawaran
          </Link>
          <Link
            href="/chat"
            className={`flex items-center gap-1 font-semibold transition ${
              pathname === "/chat"
                ? "text-[#0F2334] underline underline-offset-4"
                : "text-[#9A7840] hover:text-[#0F2334]"
            }`}
          >
            <span>✦ Tanya Nia</span>
          </Link>
          <Link
            href="/kontak"
            className={
              pathname === "/kontak"
                ? "text-[#0F2334] font-semibold"
                : "hover:text-[#0F2334]"
            }
          >
            Hubungi kami
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/reservasi/reservasi-saya"
            className="hidden sm:inline text-xs font-medium text-stone-600 hover:text-[#0F2334]"
          >
            Reservasi saya
          </Link>
          <Link
            href="/reservasi/checkout"
            className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-4 py-2 rounded transition"
          >
            Pesan kamar
          </Link>
        </div>
      </div>
    </header>
  );
}