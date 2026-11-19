"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function StaffLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Ringkasan shift", href: "/staff" },
    { label: "Front desk", href: "/staff/front-desk" },
    { label: "Kamar & kebersihan", href: "/staff/kamar" },
    { label: "Pesan tamu", href: "/staff/pesan" },
    { label: "Kendala & eskalasi", href: "/staff/kendala" },
  ];

  const getBreadcrumb = () => {
    if (pathname?.startsWith("/staff/front-desk")) return "Front desk";
    if (pathname?.startsWith("/staff/kamar")) return "Kamar & kebersihan";
    if (pathname?.startsWith("/staff/pesan")) return "Pesan tamu";
    if (pathname?.startsWith("/staff/kendala")) return "Kendala & eskalasi";
    return "Ringkasan shift";
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] flex font-sans text-[#0F2334]">
      {/* Sembunyikan Navbar publik bawaan app/layout.tsx */}
      <style jsx global>{`
        body > header,
        body > nav,
        body > div > header:first-child {
          display: none !important;
        }
      `}</style>

      {/* SIDEBAR KIRI */}
      <aside className="w-60 bg-[#0F2334] text-white flex flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div className="p-5 space-y-6">
          {/* LOGO */}
          <Link href="/staff" className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-[#C6A267] text-[#C6A267] flex items-center justify-center font-serif font-bold text-lg">
              N
            </div>
            <div className="leading-none">
              <span className="block font-bold tracking-[0.16em] text-xs text-white">
                NESTRA
              </span>
              <span className="text-[9px] tracking-[0.22em] text-stone-400">
                HOTEL
              </span>
            </div>
          </Link>

          {/* INFO PORTAL KARYAWAN */}
          <div className="border-y border-white/10 py-3.5 space-y-2">
            <p className="text-[9px] tracking-widest uppercase text-[#C6A267] font-semibold">
              PORTAL KARYAWAN
            </p>
            <p className="text-xs font-semibold text-white">
              Nestra Yogyakarta
            </p>
            <span className="inline-block bg-white/10 text-stone-200 text-[10px] px-2.5 py-1 rounded">
              Akses operasional
            </span>
          </div>

          {/* 5 MENU NAVIGASI */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const isActive =
                item.href === "/staff"
                  ? pathname === "/staff"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3.5 py-2.5 rounded transition ${
                    isActive
                      ? "bg-white/12 text-white font-semibold"
                      : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER SIDEBAR */}
        <div className="p-5 border-t border-white/10 space-y-4 text-xs">
          <div className="space-y-1">
            <p className="text-[9px] tracking-widest uppercase text-stone-400 font-semibold">
              KHUSUS KARYAWAN
            </p>
            <p className="text-[10px] text-stone-400 leading-relaxed">
              Kelola layanan harian. Persetujuan kendala berat ditangani oleh
              manajer.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-1">
            <p className="font-semibold text-white text-xs">Dimas Saputra</p>
            <p className="text-[10px] text-stone-400">
              Front desk • Shift pagi
            </p>
            <Link
              href="/login"
              className="inline-block text-[11px] text-stone-300 hover:text-white pt-1"
            >
              Keluar dari akun →
            </Link>
          </div>
        </div>
      </aside>

      {/* AREA KONTEN KANAN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="bg-white border-b border-stone-200/80 h-14 px-6 sm:px-8 flex items-center justify-between text-xs sticky top-0 z-30">
          <div className="text-stone-400">
            Nestra Yogyakarta / Karyawan /{" "}
            <span className="text-[#0F2334] font-medium">
              {getBreadcrumb()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-stone-500">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="bg-stone-100 border border-stone-200 text-[#0F2334] text-[10px] font-semibold px-2.5 py-1 rounded">
              Karyawan
            </span>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {children}

          {/* BANNER AKSES OPERASIONAL SAJA */}
          <div className="bg-white border border-stone-200/90 rounded-md px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <p className="font-semibold text-[#0F2334]">
                Akses karyawan • Operasional saja
              </p>
              <p className="text-[11px] text-stone-400">
                Laporan keuangan, omzet, dan persetujuan refund hanya tersedia
                untuk admin.
              </p>
            </div>
            <span className="text-[11px] text-stone-400">
              Nestra Hotel • Portal karyawan
            </span>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="px-8 py-4 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-400">
          <span>Data sinkron dengan PostgreSQL • Nestra Hotel</span>
          <span>Nestra Yogyakarta</span>
        </footer>
      </div>
    </div>
  );
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F5F2] flex items-center justify-center text-xs text-stone-400">
          Memuat portal karyawan...
        </div>
      }
    >
      <StaffLayoutContent>{children}</StaffLayoutContent>
    </Suspense>
  );
}