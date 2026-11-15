"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8F6F2] text-[#1A202C]">
      {/* TOP BAR */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0F2334] text-white flex items-center justify-center font-serif font-bold text-lg rounded-sm">
            N
          </div>
          <div className="leading-none">
            <span className="block font-bold tracking-wider text-sm text-[#0F2334]">
              NESTRA
            </span>
            <span className="text-[10px] tracking-[0.2em] text-stone-500">
              INTERNAL PORTAL
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs text-stone-500 hover:text-[#0F2334] transition"
        >
          ← Kembali ke situs tamu
        </Link>
      </header>

      {/* LOGIN CARD */}
      <main className="px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-md border border-stone-200/90 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-[#9A7B4F] font-semibold">
              AKSES TERBATAS STAF
            </span>
            <h1 className="font-serif text-2xl text-[#0F2334]">
              Portal Manajemen Nestra Hotel
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              Masuk menggunakan akun Google resmi yang telah terdaftar pada
              sistem administrasi hotel.
            </p>
          </div>

          {error === "AccessDenied" && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded leading-relaxed">
              <strong>Akses ditolak.</strong> Alamat Gmail Anda tidak terdaftar
              sebagai administrator Nestra Hotel.
            </div>
          )}

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/admin" })}
            className="w-full flex items-center justify-center gap-3 bg-[#0F2334] hover:bg-[#19354d] text-white py-3.5 px-4 rounded text-xs font-semibold transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.5H12v4.8h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.4 7.4 24 12 24z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>

          <p className="text-[11px] text-center text-stone-400">
            Sistem memverifikasi email Google Anda secara otomatis terhadap
            database staf.
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-[11px] text-stone-400">
        Nestra Hotel Yogyakarta • Sistem Internal
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-xs">Memuat...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}