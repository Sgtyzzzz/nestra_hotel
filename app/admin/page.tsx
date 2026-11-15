"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface BookingRow {
  id: string;
  bookingCode: string;
  guestFirstName: string;
  guestLastName: string;
  arrivalTime: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  room: {
    name: string;
  };
}

interface OverviewResponse {
  admin: {
    name: string;
    email: string;
    roleLabel: string;
  };
  stats: {
    totalRooms: number;
    upcomingCount: number;
    completedCount: number;
    revenueBeforeTax: number;
    unreadContacts: number;
  };
  bookings: BookingRow[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ARRIVAL" | "DEPARTURE">("ARRIVAL");
  const [processingCode, setProcessingCode] = useState<string | null>(null);

  // State tanggal & sapaan agar tidak dipanggil langsung saat render (kompatibel Next.js 16)
  const [greeting, setGreeting] = useState("Selamat datang");
  const [todayFormatted, setTodayFormatted] = useState("");

  const loadOverview = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();

    const now = new Date();
    const hour = now.getHours();
    if (hour < 11) setGreeting("Selamat pagi");
    else if (hour < 15) setGreeting("Selamat siang");
    else if (hour < 18) setGreeting("Selamat sore");
    else setGreeting("Selamat malam");

    setTodayFormatted(
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const handleCheckInProcess = async (bookingCode: string) => {
    setProcessingCode(bookingCode);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", paymentStatus: "PAID" }),
      });
      if (res.ok) {
        await loadOverview();
      }
    } finally {
      setProcessingCode(null);
    }
  };

  const fullName = data?.admin.name || "Admin Nestra";
  const firstName = fullName.split(" ")[0];
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const formatRupiahCompact = (amount: number) => {
    if (amount >= 1_000_000) {
      const juta = (amount / 1_000_000).toFixed(1).replace(".", ",");
      return `Rp${juta} jt`;
    }
    return "Rp" + amount.toLocaleString("id-ID");
  };

  const arrivals =
    data?.bookings.filter((b) => b.status === "UPCOMING") || [];
  const departures =
    data?.bookings.filter((b) => b.status === "COMPLETED") || [];
  const displayedRows = activeTab === "ARRIVAL" ? arrivals : departures;

  const occupancyPercent = data
    ? Math.min(100, Math.round((arrivals.length / 10) * 100))
    : 0;

  return (
    <div className="min-h-screen flex bg-[#F8F6F2] text-[#1A202C]">
      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-[#0F2334] text-white flex flex-col justify-between shrink-0 hidden lg:flex">
        <div className="p-6 space-y-7">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-[#C6A267]/60 text-[#C6A267] flex items-center justify-center font-serif font-bold text-lg rounded-sm">
              N
            </div>
            <div className="leading-none">
              <span className="block font-bold tracking-wider text-sm text-white">
                NESTRA
              </span>
              <span className="text-[10px] tracking-[0.2em] text-stone-400">
                HOTEL
              </span>
            </div>
          </Link>

          {/* Property Selector */}
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-[0.18em] text-stone-400 font-semibold">
              PENGELOLA HOTEL
            </span>
            <div className="flex items-center justify-between text-xs font-medium text-white py-1">
              <span>Nestra Yogyakarta</span>
              <span className="text-stone-400 text-[10px]">⌄</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1 text-xs">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded bg-white/10 text-white font-semibold"
            >
              <span>⊞</span>
              <span>Beranda</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded text-stone-300 hover:bg-white/5 hover:text-white transition"
            >
              <span>◫</span>
              <span>Ringkasan</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded text-stone-300 hover:bg-white/5 hover:text-white transition"
            >
              <span>📅</span>
              <span>Reservasi</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded text-stone-300 hover:bg-white/5 hover:text-white transition"
            >
              <span>🛏</span>
              <span>Kamar & kebersihan</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded text-stone-300 hover:bg-white/5 hover:text-white transition"
            >
              <span>📈</span>
              <span>Pendapatan & laporan</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded text-stone-300 hover:bg-white/5 hover:text-white transition"
            >
              <span>👥</span>
              <span>Tamu</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded text-stone-300 hover:bg-white/5 hover:text-white transition"
            >
              <span>⚙</span>
              <span>Pengaturan</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Admin Profile (Dinamis sesuai akun Gmail yang login) */}
        <div className="p-6 border-t border-white/10 space-y-5">
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <Link href="/" target="_blank" className="hover:text-white">
              Lihat situs hotel ↗
            </Link>
            <Link href="/kontak" className="hover:text-white">
              Pusat bantuan
            </Link>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-white">{fullName}</p>
            <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <span>{data?.admin.roleLabel || "Manajer Hotel"}</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="text-stone-300 hover:text-white underline cursor-pointer"
              >
                Keluar
              </button>
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-14 bg-white border-b border-stone-200 px-6 md:px-8 flex items-center justify-between text-xs">
          <div className="text-stone-500">
            <span>Nestra Yogyakarta</span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-[#0F2334]">Beranda</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-stone-400 text-[11px]">
              {todayFormatted}
            </span>
            <button
              type="button"
              className="relative text-stone-600 hover:text-[#0F2334]"
              title="Notifikasi operasional"
            >
              🔔
              {(data?.stats.unreadContacts || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
            <div
              title={`${fullName} (${data?.admin.email || ""})`}
              className="w-7 h-7 rounded bg-[#F0ECE3] border border-stone-300 text-[#0F2334] font-bold text-[11px] flex items-center justify-center"
            >
              {initials || "AD"}
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8 flex-1">
          {/* HERO GREETING CARD */}
          <section className="bg-[#0F2334] text-white rounded-md p-6 md:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C6A267] font-semibold">
                BERANDA ADMIN
              </span>
              <span className="text-[11px] text-stone-300">
                {todayFormatted}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl md:text-3xl text-white">
                {greeting}, {firstName}.
              </h1>
              <p className="text-xs text-stone-300">
                Selamat datang kembali. Kelola operasional Nestra Yogyakarta dari
                satu tempat.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/kamar"
                className="bg-white text-[#0F2334] hover:bg-stone-100 px-4 py-2 rounded text-xs font-semibold transition"
              >
                + Tambah reservasi
              </Link>
              <Link
                href="/reservasi-saya"
                className="border border-white/25 hover:border-white/50 text-white px-4 py-2 rounded text-xs font-medium transition"
              >
                Lihat ringkasan hotel →
              </Link>
            </div>
          </section>

          {/* KONDISI HOTEL HARI INI (4 METRIC CARDS) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-[#0F2334]">
                Kondisi hotel hari ini
              </h2>
              <span className="text-[11px] text-stone-400">
                Data langsung dari PostgreSQL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-md border border-stone-200/90 space-y-2">
                <span className="block text-[11px] text-stone-500">
                  Okupansi aktif
                </span>
                <p className="text-2xl font-bold text-[#0F2334]">
                  {loading ? "..." : `${occupancyPercent}%`}
                </p>
                <p className="text-[11px] text-emerald-700">
                  {arrivals.length} reservasi aktif •{" "}
                  {data?.stats.totalRooms || 3} tipe kamar
                </p>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200/90 space-y-2">
                <span className="block text-[11px] text-stone-500">
                  Pendapatan kamar tercatat
                </span>
                <p className="text-2xl font-bold text-[#0F2334]">
                  {loading
                    ? "..."
                    : formatRupiahCompact(data?.stats.revenueBeforeTax || 0)}
                </p>
                <p className="text-[11px] text-stone-400">
                  Berdasarkan kamar terpesan • sebelum pajak
                </p>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200/90 space-y-2">
                <span className="block text-[11px] text-stone-500">
                  Kedatangan dijadwalkan
                </span>
                <p className="text-2xl font-bold text-[#0F2334]">
                  {loading ? "..." : arrivals.length}
                </p>
                <p className="text-[11px] text-stone-400">
                  {departures.length} sudah selesai • {arrivals.length} menunggu
                  check-in
                </p>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200/90 space-y-2">
                <span className="block text-[11px] text-stone-500">
                  Riwayat menginap selesai
                </span>
                <p className="text-2xl font-bold text-[#0F2334]">
                  {loading ? "..." : departures.length}
                </p>
                <p className="text-[11px] text-stone-400">
                  Tamu telah check-out
                </p>
              </div>
            </div>
          </section>

          {/* AKSES CEPAT (3 CARDS) */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg text-[#0F2334]">Akses cepat</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-md border border-stone-200/90 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-base">📅</span>
                  <h3 className="text-sm font-bold text-[#0F2334]">
                    Reservasi
                  </h3>
                  <p className="text-xs text-stone-500">
                    Kelola pemesanan dan proses masuk tamu.
                  </p>
                </div>
                <a
                  href="#tabel-kedatangan"
                  className="text-xs font-semibold text-[#0F2334] hover:underline"
                >
                  Kelola reservasi →
                </a>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200/90 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-base">🛏</span>
                  <h3 className="text-sm font-bold text-[#0F2334]">
                    Kamar & kebersihan
                  </h3>
                  <p className="text-xs text-stone-500">
                    Pantau kesiapan kamar dan tugas tim.
                  </p>
                </div>
                <Link
                  href="/kamar"
                  className="text-xs font-semibold text-[#0F2334] hover:underline"
                >
                  Kelola kamar →
                </Link>
              </div>

              <div className="bg-white p-5 rounded-md border border-stone-200/90 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-base">📈</span>
                  <h3 className="text-sm font-bold text-[#0F2334]">
                    Pendapatan & laporan
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tinjau pendapatan dan kinerja hotel.
                  </p>
                </div>
                <a
                  href="#tabel-kedatangan"
                  className="text-xs font-semibold text-[#0F2334] hover:underline"
                >
                  Buka laporan →
                </a>
              </div>
            </div>
          </section>

          {/* BOTTOM 2 COLUMNS: KEDATANGAN & PRIORITAS OPERASIONAL */}
          <section
            id="tabel-kedatangan"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* LEFT TABLE (7 COLS) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-md border border-stone-200/90 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-lg text-[#0F2334]">
                  Kedatangan & keberangkatan
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5 text-xs">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ARRIVAL")}
                    className={`pb-2.5 -mb-[11px] cursor-pointer ${
                      activeTab === "ARRIVAL"
                        ? "border-b-2 border-[#0F2334] font-bold text-[#0F2334]"
                        : "text-stone-500 hover:text-[#0F2334]"
                    }`}
                  >
                    Kedatangan ({arrivals.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("DEPARTURE")}
                    className={`pb-2.5 -mb-[11px] cursor-pointer ${
                      activeTab === "DEPARTURE"
                        ? "border-b-2 border-[#0F2334] font-bold text-[#0F2334]"
                        : "text-stone-500 hover:text-[#0F2334]"
                    }`}
                  >
                    Selesai / Keberangkatan ({departures.length})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F6F2] text-stone-500 text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Tamu</th>
                      <th className="py-2.5 px-3 font-medium">Tipe Kamar</th>
                      <th className="py-2.5 px-3 font-medium">Perkiraan</th>
                      <th className="py-2.5 px-3 font-medium">Pembayaran</th>
                      <th className="py-2.5 px-3 font-medium text-right">
                        Tindakan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-stone-400"
                        >
                          Memuat data tamu...
                        </td>
                      </tr>
                    ) : displayedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-stone-400"
                        >
                          Belum ada data pada tab ini.
                        </td>
                      </tr>
                    ) : (
                      displayedRows.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3">
                            <p className="font-semibold text-[#0F2334]">
                              {item.guestFirstName} {item.guestLastName}
                            </p>
                            <p className="text-[10px] text-stone-400">
                              {item.bookingCode}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-stone-600">
                            {item.room.name}
                          </td>
                          <td className="py-3 px-3 text-stone-600">
                            {item.arrivalTime || "14.00"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${
                                item.paymentStatus === "PAID"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {item.paymentStatus === "PAID"
                                ? "Lunas"
                                : "Belum lunas"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {item.status === "UPCOMING" ? (
                              <button
                                type="button"
                                disabled={processingCode === item.bookingCode}
                                onClick={() =>
                                  handleCheckInProcess(item.bookingCode)
                                }
                                className="border border-stone-300 hover:border-[#0F2334] text-[#0F2334] px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer"
                              >
                                {processingCode === item.bookingCode
                                  ? "Memproses..."
                                  : "Proses masuk"}
                              </button>
                            ) : (
                              <Link
                                href={`/reservasi/konfirmasi?code=${item.bookingCode}`}
                                className="text-[11px] text-stone-600 hover:text-[#0F2334] font-medium"
                              >
                                Lihat detail →
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT OPERATIONAL PRIORITIES (5 COLS) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-md border border-stone-200/90 space-y-4">
              <h2 className="font-serif text-lg text-[#0F2334]">
                Prioritas operasional
              </h2>

              <div className="divide-y divide-stone-100">
                <div className="pb-3.5 space-y-1">
                  <span className="inline-block bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                    Tinggi
                  </span>
                  <p className="text-xs font-bold text-[#0F2334] pt-1">
                    Periksa pendingin kamar Deluks
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Teknisi Arif • Tenggat 11.00
                  </p>
                </div>

                <div className="py-3.5 space-y-1">
                  <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                    Sedang
                  </span>
                  <p className="text-xs font-bold text-[#0F2334] pt-1">
                    Siapkan kamar untuk kedatangan hari ini
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Tim Housekeeping • Tenggat 13.00
                  </p>
                </div>

                <div className="pt-3.5 space-y-1">
                  <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                    Sedang
                  </span>
                  <p className="text-xs font-bold text-[#0F2334] pt-1">
                    Konfirmasi sarapan tamu menginap
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Restoran Serambi • 06.30 WIB
                  </p>
                </div>
              </div>

              {(data?.stats.unreadContacts || 0) === 0 ? (
                <div className="bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs px-3.5 py-2.5 rounded flex items-center gap-2">
                  <span className="font-bold">✓</span>
                  <span>Tidak ada keluhan tamu yang belum ditangani.</span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2.5 rounded flex items-center gap-2">
                  <span className="font-bold">!</span>
                  <span>
                    Ada {data?.stats.unreadContacts} pesan tamu baru dari form
                    Hubungi Kami.
                  </span>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="px-6 md:px-8 py-4 border-t border-stone-200 text-[11px] text-stone-400 flex items-center justify-between">
          <span>Data terhubung ke PostgreSQL • Nestra Hotel</span>
          <span>Nestra Hotel • Portal pengelola</span>
        </footer>
      </div>
    </div>
  );
}