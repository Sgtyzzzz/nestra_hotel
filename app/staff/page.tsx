"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface SummaryData {
  activeBookings: number;
  dirtyRooms: number;
  unreadMessages: number;
  escalatedIncidents: number;
}

export default function StaffDashboardPage() {
  const [summary, setSummary] = useState<SummaryData>({
    activeBookings: 0,
    dirtyRooms: 0,
    unreadMessages: 0,
    escalatedIncidents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch("/api/staff/operations");
        if (res.ok) {
          const data = await res.json();
          const bookings = data.bookings || [];
          const units = data.roomUnits || [];
          const messages = data.messages || [];
          const incidents = data.incidents || [];

          setSummary({
            activeBookings: bookings.filter(
              (b: { status: string }) => b.status === "UPCOMING"
            ).length,
            dirtyRooms: units.filter(
              (u: { status: string }) => u.status === "DIRTY"
            ).length,
            unreadMessages: messages.filter(
              (m: { isRead: boolean }) => !m.isRead
            ).length,
            escalatedIncidents: incidents.filter(
              (i: { status: string }) => i.status === "ESCALATED"
            ).length,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* BANNER SAPAAN SHIFT */}
      <div className="bg-[#0F2334] text-white rounded-md p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C6A267] font-semibold">
            DASHBOARD KARYAWAN
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Selamat pagi, Dimas.
          </h1>
          <p className="text-xs text-stone-300">
            Semua kebutuhan operasional shift Anda, dalam satu tempat.
          </p>
        </div>
        <span className="text-[11px] text-stone-300">
          Shift pagi • 07.00–15.00 WIB
        </span>
      </div>

      {/* 4 KARTU KPI SHIFT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Tamu hari ini</p>
          <p className="font-serif text-2xl font-bold text-[#0F2334]">
            {loading ? "..." : `${summary.activeBookings} tamu`}
          </p>
          <p className="text-[10px] text-stone-400">
            Menunggu proses check-in / out
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Perlu dibersihkan</p>
          <p className="font-serif text-2xl font-bold text-[#B8893E]">
            {loading ? "..." : `${summary.dirtyRooms} kamar`}
          </p>
          <p className="text-[10px] text-stone-400">
            Menunggu penanganan housekeeping
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Pesan baru</p>
          <p className="font-serif text-2xl font-bold text-[#0F2334]">
            {loading ? "..." : `${summary.unreadMessages} pesan`}
          </p>
          <p className="text-[10px] text-stone-400">
            Dari formulir kontak website
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Dieskalasi ke atasan</p>
          <p className="font-serif text-2xl font-bold text-red-600">
            {loading ? "..." : `${summary.escalatedIncidents} kendala`}
          </p>
          <p className="text-[10px] text-stone-400">
            Menunggu tindak lanjut manajer
          </p>
        </div>
      </div>

      {/* RUANG KERJA ANDA */}
      <div className="space-y-3 pt-1">
        <h2 className="font-serif text-lg font-bold text-[#0F2334]">
          Ruang kerja Anda
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/staff/front-desk"
            className="bg-white border border-stone-200/90 hover:border-[#0F2334] rounded-md p-6 space-y-2 transition group"
          >
            <h3 className="font-serif text-base font-bold text-[#0F2334]">
              Front desk
            </h3>
            <p className="text-xs text-stone-500">
              Daftar kedatangan, keberangkatan, dan reservasi walk-in.
            </p>
            <p className="text-xs font-semibold text-[#0F2334] pt-2 group-hover:translate-x-1 transition-transform">
              {summary.activeBookings} reservasi aktif →
            </p>
          </Link>

          <Link
            href="/staff/kamar"
            className="bg-white border border-stone-200/90 hover:border-[#0F2334] rounded-md p-6 space-y-2 transition group"
          >
            <h3 className="font-serif text-base font-bold text-[#0F2334]">
              Kamar &amp; kebersihan
            </h3>
            <p className="text-xs text-stone-500">
              Pantau kesiapan unit dan perbarui status kamar di tiga lantai.
            </p>
            <p className="text-xs font-semibold text-[#0F2334] pt-2 group-hover:translate-x-1 transition-transform">
              {summary.dirtyRooms} kamar perlu dibersihkan →
            </p>
          </Link>

          <Link
            href="/staff/pesan"
            className="bg-white border border-stone-200/90 hover:border-[#0F2334] rounded-md p-6 space-y-2 transition group"
          >
            <h3 className="font-serif text-base font-bold text-[#0F2334]">
              Pesan tamu
            </h3>
            <p className="text-xs text-stone-500">
              Baca dan tindak lanjuti permintaan dari formulir website.
            </p>
            <p className="text-xs font-semibold text-[#0F2334] pt-2 group-hover:translate-x-1 transition-transform">
              {summary.unreadMessages} pesan baru →
            </p>
          </Link>

          <Link
            href="/staff/kendala"
            className="bg-white border border-stone-200/90 hover:border-[#0F2334] rounded-md p-6 space-y-2 transition group"
          >
            <h3 className="font-serif text-base font-bold text-[#0F2334]">
              Kendala &amp; eskalasi
            </h3>
            <p className="text-xs text-stone-500">
              Catat kejadian dan teruskan masalah berat ke manajer.
            </p>
            <p className="text-xs font-semibold text-[#0F2334] pt-2 group-hover:translate-x-1 transition-transform">
              {summary.escalatedIncidents} kendala dieskalasi →
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}