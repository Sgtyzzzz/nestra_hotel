"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AdminBooking {
  id: string;
  bookingCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  arrivalTime: string;
  specialRequest: string;
  roomId: string;
  roomName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  roomSubtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status:
    | "PENDING"
    | "UPCOMING"
    | "CHECKED_IN"
    | "OVERDUE"
    | "COMPLETED"
    | "CANCELLED";
  paymentStatus: "PENDING" | "UNPAID" | "PAID" | "REFUNDED";
  paymentMethod: string;
}

interface RoomOption {
  id: string;
  name: string;
  basePrice: number;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState("");

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "UPCOMING" | "CHECKED_IN" | "OVERDUE" | "COMPLETED" | "CANCELLED"
  >("ALL");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Modal Tambah Reservasi
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newBooking, setNewBooking] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    paymentStatus: "PENDING",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resBookings, resRooms] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/rooms"),
      ]);
      if (resBookings.ok) {
        const data = await resBookings.json();
        setBookings(Array.isArray(data) ? data : []);
      }
      if (resRooms.ok) {
        const roomData = await resRooms.json();
        if (Array.isArray(roomData)) {
          setRooms(roomData);
          if (roomData[0]) {
            setNewBooking((prev) => ({
              ...prev,
              roomId: prev.roomId || roomData[0].id,
            }));
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000)
      .toISOString()
      .slice(0, 10);
    setTodayStr(today);
    setNewBooking((prev) => ({
      ...prev,
      checkIn: today,
      checkOut: tomorrow,
    }));
    loadData();
  }, []);

  // Hitung KPI
  const totalCount = bookings.length;
  const arrivalsToday = bookings.filter(
    (b) => b.checkIn === todayStr && b.status !== "CANCELLED"
  );
  const pendingPayments = bookings.filter(
    (b) => b.paymentStatus !== "PAID" && b.status !== "CANCELLED"
  );
  const pendingAmountTotal = pendingPayments.reduce(
    (sum, b) => sum + b.totalAmount,
    0
  );
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");
  const cancelRate =
    totalCount > 0
      ? ((cancelledBookings.length / totalCount) * 100).toFixed(1)
      : "0";

  // Filtering
  const filtered = bookings.filter((b) => {
    if (activeTab !== "ALL" && b.status !== activeTab) return false;
    if (paymentFilter === "PAID" && b.paymentStatus !== "PAID") return false;
    if (paymentFilter === "UNPAID" && b.paymentStatus === "PAID") return false;
    if (periodFilter === "TODAY" && b.checkIn !== todayStr) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        b.guestName.toLowerCase().includes(q) ||
        b.bookingCode.toLowerCase().includes(q) ||
        b.guestPhone.toLowerCase().includes(q) ||
        b.guestEmail.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelectAll = () => {
    if (selectedCodes.length === paginated.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(paginated.map((b) => b.bookingCode));
    }
  };

  const toggleSelectRow = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewBooking((prev) => ({
          ...prev,
          guestName: "",
          guestEmail: "",
          guestPhone: "",
        }));
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Kode Booking",
      "Nama Tamu",
      "Email",
      "Telepon",
      "Kamar",
      "Check-In",
      "Check-Out",
      "Status",
      "Pembayaran",
      "Total",
    ];
    const rows = filtered.map((b) => [
      b.bookingCode,
      `"${b.guestName}"`,
      b.guestEmail,
      `"${b.guestPhone}"`,
      `"${b.roomName}"`,
      b.checkIn,
      b.checkOut,
      b.status,
      b.paymentStatus,
      b.totalAmount,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `reservasi-nestra-${todayStr || "data"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatShortRange = (ci: string, co: string) => {
    const start = new Date(ci).toLocaleDateString("id-ID", { day: "numeric" });
    const end = new Date(co).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    return `${start}–${end}`;
  };

  const renderStatusBadge = (status: AdminBooking["status"]) => {
    switch (status) {
      case "CANCELLED":
        return (
          <span className="bg-red-50 text-red-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
            Dibatalkan
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-stone-100 text-stone-600 text-[10px] font-semibold px-2.5 py-0.5 rounded">
            Selesai
          </span>
        );
      case "OVERDUE":
        return (
          <span className="bg-rose-100 text-rose-800 text-[10px] font-semibold px-2.5 py-0.5 rounded">
            Lewat keluar
          </span>
        );
      case "CHECKED_IN":
        return (
          <span className="bg-sky-50 text-sky-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
            Menginap
          </span>
        );
      default:
        return (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
            Belum datang
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#0F2334]">
            Manajemen reservasi
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Pantau pemesanan, pembayaran, dan perjalanan tamu dalam satu daftar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-white border border-stone-200 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
          >
            Ekspor ↓
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
          >
            Tambah reservasi +
          </button>
        </div>
      </div>

      {/* 4 KARTU KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Total reservasi</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : totalCount}
          </p>
          <p className="text-[10px] text-stone-400">Semua kanal pemesanan</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Kedatangan hari ini</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : arrivalsToday.length}
          </p>
          <p className="text-[10px] text-stone-400">
            {
              bookings.filter(
                (b) => b.status === "UPCOMING" || b.checkIn > todayStr
              ).length
            }{" "}
            tamu belum datang
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Menunggu pembayaran</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : pendingPayments.length}
          </p>
          <p className="text-[10px] text-stone-400">
            Total tagihan Rp{pendingAmountTotal.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Lewat jadwal keluar</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading
              ? "..."
              : bookings.filter((b) => b.status === "OVERDUE").length}
          </p>
          <p className="text-[10px] text-stone-400">
            Pembatalan: {cancelledBookings.length} ({cancelRate}%)
          </p>
        </div>
      </div>

      {/* PANEL FILTER, TAB & TABEL UTAMA */}
      <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-5">
        {/* Baris Filter 4 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 space-y-1">
            <label className="block text-[10px] font-semibold text-stone-500">
              Cari reservasi
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, nomor reservasi, atau ponsel"
              className="w-full border border-stone-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#0F2334]"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="block text-[10px] font-semibold text-stone-500">
              Periode menginap
            </label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
            >
              <option value="ALL">Semua periode</option>
              <option value="TODAY">Check-in hari ini</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="block text-[10px] font-semibold text-stone-500">
              Kanal pemesanan
            </label>
            <select className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]">
              <option value="ALL">Semua kanal</option>
              <option value="WEB">Website &amp; Nia AI</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="block text-[10px] font-semibold text-stone-500">
              Pembayaran
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
            >
              <option value="ALL">Semua status</option>
              <option value="PAID">Lunas</option>
              <option value="UNPAID">Belum lunas</option>
            </select>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-6 border-b border-stone-200 pb-3 text-xs">
          {[
            { key: "ALL", label: `Semua (${bookings.length})` },
            {
              key: "UPCOMING",
              label: `Belum datang (${
                bookings.filter((b) => b.status === "UPCOMING").length
              })`,
            },
            {
              key: "CHECKED_IN",
              label: `Menginap (${
                bookings.filter((b) => b.status === "CHECKED_IN").length
              })`,
            },
            {
              key: "OVERDUE",
              label: `Lewat keluar (${
                bookings.filter((b) => b.status === "OVERDUE").length
              })`,
            },
            {
              key: "COMPLETED",
              label: `Selesai (${
                bookings.filter((b) => b.status === "COMPLETED").length
              })`,
            },
            {
              key: "CANCELLED",
              label: `Dibatalkan (${
                bookings.filter((b) => b.status === "CANCELLED").length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key as typeof activeTab);
                setPage(1);
              }}
              className={`pb-3 -mb-[13px] cursor-pointer transition ${
                activeTab === tab.key
                  ? "border-b-2 border-[#0F2334] font-bold text-[#0F2334]"
                  : "text-stone-400 hover:text-[#0F2334]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tabel Reservasi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[10px] text-stone-500 uppercase">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      paginated.length > 0 &&
                      selectedCodes.length === paginated.length
                    }
                    onChange={toggleSelectAll}
                    className="accent-[#0F2334]"
                  />
                </th>
                <th className="py-2.5 px-3 font-semibold">Nomor reservasi</th>
                <th className="py-2.5 px-3 font-semibold">Tamu</th>
                <th className="py-2.5 px-3 font-semibold">Menginap</th>
                <th className="py-2.5 px-3 font-semibold">Kamar</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Pembayaran</th>
                <th className="py-2.5 px-3 font-semibold">Total</th>
                <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">
                    Memuat daftar reservasi...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">
                    Tidak ada reservasi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]/50">
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedCodes.includes(item.bookingCode)}
                        onChange={() => toggleSelectRow(item.bookingCode)}
                        className="accent-[#0F2334]"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0F2334]">
                      {item.bookingCode}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#0F2334]">
                      {item.guestName}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {formatShortRange(item.checkIn, item.checkOut)}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {item.status === "UPCOMING" || item.status === "CANCELLED"
                        ? "—"
                        : item.roomNumber}{" "}
                      · {item.roomName.replace("Kamar ", "")}
                    </td>
                    <td className="py-3 px-3">
                      {renderStatusBadge(item.status)}
                    </td>
                    <td className="py-3 px-3">
                      {item.status === "CANCELLED" ? (
                        <span className="bg-stone-100 text-stone-500 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                          Dikembalikan
                        </span>
                      ) : item.paymentStatus === "PAID" ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                          Lunas
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                          Belum lunas
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#0F2334]">
                      Rp{item.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/reservasi/${item.bookingCode}`}
                        className="text-xs font-semibold text-[#0F2334] hover:underline"
                      >
                        Detail ↗
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <span>
            Menampilkan {paginated.length} dari {filtered.length} reservasi
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 border border-stone-200 rounded flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer ${
                  page === num
                    ? "bg-[#0F2334] text-white"
                    : "border border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 border border-stone-200 rounded flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* 2 BANNER INFO BAWAH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#EEF2F6] border border-stone-200/80 rounded-md px-4 py-3 text-xs text-[#0F2334] flex items-center gap-2.5">
          <span>ⓘ</span>
          <span>
            {selectedCodes.length > 0
              ? `${selectedCodes.length} reservasi terpilih siap dikelola.`
              : "Pilih satu atau beberapa reservasi untuk mengirim pengingat pembayaran atau mengunduh konfirmasi."}
          </span>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-md px-4 py-3 text-xs text-emerald-800 flex items-center gap-2.5">
          <span>✓</span>
          <span>Status menginap disinkronkan otomatis dengan tanggal hari ini.</span>
        </div>
      </div>

      {/* MODAL TAMBAH RESERVASI MANUAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBooking}
            className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-xl text-[#0F2334]">
                Tambah reservasi baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-stone-400 hover:text-[#0F2334] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama lengkap</label>
                <input
                  type="text"
                  required
                  value={newBooking.guestName}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, guestName: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newBooking.guestEmail}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        guestEmail: e.target.value,
                      })
                    }
                    className="w-full border border-stone-200 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">No. Ponsel</label>
                  <input
                    type="text"
                    required
                    value={newBooking.guestPhone}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        guestPhone: e.target.value,
                      })
                    }
                    className="w-full border border-stone-200 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tipe kamar</label>
                <select
                  value={newBooking.roomId}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, roomId: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3 py-2 bg-white"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Rp{r.basePrice.toLocaleString("id-ID")}/malam)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Check-in</label>
                  <input
                    type="date"
                    required
                    value={newBooking.checkIn}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, checkIn: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Check-out</label>
                  <input
                    type="date"
                    required
                    value={newBooking.checkOut}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, checkOut: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Status pembayaran
                </label>
                <select
                  value={newBooking.paymentStatus}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="w-full border border-stone-200 rounded px-3 py-2 bg-white"
                >
                  <option value="PENDING">Belum lunas (Bayar saat tiba)</option>
                  <option value="PAID">Lunas (Tunai / Transfer)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="border border-stone-200 px-4 py-2 rounded text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0F2334] text-white px-4 py-2 rounded text-xs font-semibold cursor-pointer"
              >
                {saving ? "Menyimpan..." : "Simpan reservasi"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}