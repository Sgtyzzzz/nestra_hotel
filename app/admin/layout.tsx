"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function AdminSidebarContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Ringkasan", href: "/admin", icon: "⊞" },
    { label: "Reservasi", href: "/admin/reservasi", icon: "📅" },
    { label: "Kamar & kebersihan", href: "/admin/kamar", icon: "🛏️" },
    { label: "Pendapatan & laporan", href: "/admin/pendapatan", icon: "📈" },
  ];

  const getPageTitle = () => {
    if (pathname?.startsWith("/admin/reservasi")) return "Reservasi";
    if (pathname?.startsWith("/admin/kamar")) return "Kamar & kebersihan";
    if (pathname?.startsWith("/admin/pendapatan"))
      return "Pendapatan & laporan";
    return "Ringkasan";
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] flex font-sans text-[#0F2334]">
      {/* SIDEBAR KIRI */}
      <aside className="w-60 bg-[#0F2334] text-white flex flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div className="p-5 space-y-6">
          {/* LOGO */}
          <Link href="/admin" className="flex items-center gap-2.5">
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

          {/* INFO PROPERTI */}
          <div className="border-y border-white/10 py-3">
            <p className="text-[9px] tracking-widest uppercase text-stone-400">
              PENGELOLA HOTEL
            </p>
            <p className="text-xs font-semibold text-white mt-0.5">
              Nestra Yogyakarta
            </p>
          </div>

          {/* MENU NAVIGASI (4 MENU) */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition ${
                    isActive
                      ? "bg-white/12 text-white font-semibold"
                      : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER SIDEBAR */}
        <div className="p-5 border-t border-white/10 space-y-4 text-xs">
          <div className="flex items-center gap-3 text-[11px] text-stone-300">
            <Link href="/" className="hover:text-white">
              Lihat situs hotel ↗
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <p className="font-semibold text-white text-xs">Rani Wulandari</p>
              <p className="text-[10px] text-stone-400">Manajer hotel</p>
            </div>
            <Link
              href="/"
              className="text-[11px] text-stone-400 hover:text-white"
            >
              Keluar
            </Link>
          </div>
        </div>
      </aside>

      {/* AREA KONTEN KANAN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="bg-white border-b border-stone-200/80 h-14 px-6 flex items-center justify-between text-xs sticky top-0 z-30">
          <div className="text-stone-400">
            Nestra Yogyakarta /{" "}
            <span className="text-[#0F2334] font-medium">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[11px] text-stone-500">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="w-7 h-7 rounded-full bg-[#0F2334] text-white text-[10px] font-bold flex items-center justify-center">
              RW
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="px-8 py-4 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-400">
          <span>Data sinkron dengan PostgreSQL • Nestra Hotel</span>
          <span>Nestra Hotel • Portal pengelola</span>
        </footer>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F5F2] flex items-center justify-center text-xs text-stone-400">
          Memuat portal admin...
        </div>
      }
    >
      <AdminSidebarContent>{children}</AdminSidebarContent>
    </Suspense>
  );
}