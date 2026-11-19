"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface BookingDetail {
  id: string;
  bookingCode: string;
  guestName: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  arrivalTime: string;
  specialRequest: string;
  roomName: string;
  roomNumber: string;
  bedType: string;
  basePrice: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  roomSubtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: "PENDING" | "UPCOMING" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "UNPAID" | "PAID" | "REFUNDED";
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
}

export default function AdminBookingDetailPage() {
  const params = useParams();
  const code = String(params?.code || "");

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Catatan & Edit Tamu
  const [internalNote, setInternalNote] = useState("");
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  const [guestForm, setGuestForm] = useState({
    guestFirstName: "",
    guestLastName: "",
    guestEmail: "",
    guestPhone: "",
  });

  const loadDetail = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data: BookingDetail = await res.json();
        setBooking(data);
        setInternalNote(
          data.specialRequest ||
            `Kamar ${data.roomNumber} sudah disiapkan. Konfirmasi identitas dan jumlah tamu saat kedatangan.`
        );
        setGuestForm({
          guestFirstName: data.guestFirstName,
          guestLastName: data.guestLastName === "-" ? "" : data.guestLastName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [code]);

  const handlePatch = async (payload: Record<string, unknown>) => {
    if (!booking) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/bookings/${encodeURIComponent(booking.bookingCode)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        await loadDetail();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    await handlePatch({
      guestFirstName: guestForm.guestFirstName,
      guestLastName: guestForm.guestLastName || "-",
      guestEmail: guestForm.guestEmail,
      guestPhone: guestForm.guestPhone,
    });
    setIsEditingGuest(false);
  };

  const handleSaveNote = async () => {
    await handlePatch({ specialRequest: internalNote });
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2500);
  };

  const formatDateFull = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatShortDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-stone-400">
        Memuat detail reservasi...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-white border border-stone-200 rounded-md p-8 text-center space-y-3">
        <p className="font-serif text-xl text-[#0F2334]">
          Reservasi tidak ditemukan
        </p>
        <Link
          href="/admin/reservasi"
          className="inline-block text-xs font-semibold text-[#0F2334] underline"
        >
          ← Kembali ke daftar reservasi
        </Link>
      </div>
    );
  }

  const remainingBalance =
    booking.paymentStatus === "PAID" ? 0 : booking.totalAmount;

  return (
    <div className="space-y-6">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#0F2334]">
            Detail reservasi
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            <Link href="/admin/reservasi" className="hover:underline">
              Reservasi
            </Link>{" "}
            / {booking.bookingCode} • Dibuat melalui situs resmi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-white border border-stone-200 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
          >
            Cetak konfirmasi 🖨
          </button>

          {booking.status === "UPCOMING" ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => handlePatch({ status: "COMPLETED" })}
              className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
            >
              {saving ? "Memproses..." : "Proses masuk"}
            </button>
          ) : (
            <span className="bg-stone-200 text-stone-700 text-xs font-semibold px-4 py-2 rounded">
              {booking.status === "COMPLETED" ? "Sudah masuk" : "Dibatalkan"}
            </span>
          )}
        </div>
      </div>

      {/* BANNER HERO DARK NAVY */}
      <div className="bg-[#0F2334] text-white rounded-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="block text-[10px] tracking-[0.16em] text-[#C6A267] font-mono uppercase">
            {booking.bookingCode}
          </span>
          <h2 className="font-serif text-2xl font-normal">
            {booking.guestName}
          </h2>
          <p className="text-xs text-stone-300">
            {formatShortDate(booking.checkIn)}–
            {formatDateFull(booking.checkOut)} • {booking.nights} malam •{" "}
            {booking.adults} dewasa • 1 kamar
          </p>
        </div>

        <div className="sm:text-right space-y-2">
          <div className="flex sm:justify-end gap-2">
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded ${
                booking.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-emerald-100 text-emerald-900"
              }`}
            >
              {booking.status === "CANCELLED"
                ? "Dibatalkan"
                : booking.status === "COMPLETED"
                ? "Menginap / Selesai"
                : "Dikonfirmasi"}
            </span>
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded ${
                booking.paymentStatus === "PAID"
                  ? "bg-emerald-50 text-emerald-900"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {booking.paymentStatus === "PAID"
                ? "Lunas • Saldo Rp0"
                : `Belum lunas • Saldo Rp${remainingBalance.toLocaleString(
                    "id-ID"
                  )}`}
            </span>
          </div>
          <p className="text-[11px] text-stone-300">
            Perkiraan kedatangan {booking.arrivalTime}
          </p>
        </div>
      </div>

      {/* GRID UTAMA (KIRI 8 KOLOM + KANAN 4 KOLOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* KOLOM KIRI (8 KOLOM) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 2 KARTU ATAS: INFORMASI TAMU & PENEMPATAN KAMAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Informasi Tamu */}
            <div className="bg-white border border-stone-200/90 rounded-md p-6 flex flex-col justify-between space-y-4">
              {!isEditingGuest ? (
                <>
                  <div className="space-y-3">
                    <h3 className="font-serif text-lg text-[#0F2334]">
                      Informasi tamu
                    </h3>
                    <div>
                      <p className="text-sm font-bold text-[#0F2334]">
                        {booking.guestName}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {booking.guestEmail} • {booking.guestPhone}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Negara</span>
                        <span className="font-medium text-[#0F2334]">
                          Indonesia
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Tamu</span>
                        <span className="font-medium text-[#0F2334]">
                          {booking.adults} dewasa • 0 anak
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-stone-400 pt-2">
                      KTP/paspor diperiksa saat masuk. Tidak ada dokumen yang
                      tersimpan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingGuest(true)}
                    className="text-left text-xs font-semibold text-[#0F2334] hover:underline cursor-pointer"
                  >
                    Ubah data tamu →
                  </button>
                </>
              ) : (
                <form onSubmit={handleSaveGuest} className="space-y-3 text-xs">
                  <h3 className="font-serif text-lg text-[#0F2334]">
                    Ubah data tamu
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={guestForm.guestFirstName}
                      onChange={(e) =>
                        setGuestForm({
                          ...guestForm,
                          guestFirstName: e.target.value,
                        })
                      }
                      placeholder="Nama depan"
                      className="border border-stone-200 rounded px-2.5 py-1.5"
                    />
                    <input
                      type="text"
                      value={guestForm.guestLastName}
                      onChange={(e) =>
                        setGuestForm({
                          ...guestForm,
                          guestLastName: e.target.value,
                        })
                      }
                      placeholder="Nama belakang"
                      className="border border-stone-200 rounded px-2.5 py-1.5"
                    />
                  </div>
                  <input
                    type="email"
                    required
                    value={guestForm.guestEmail}
                    onChange={(e) =>
                      setGuestForm({ ...guestForm, guestEmail: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-2.5 py-1.5"
                  />
                  <input
                    type="text"
                    required
                    value={guestForm.guestPhone}
                    onChange={(e) =>
                      setGuestForm({ ...guestForm, guestPhone: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-2.5 py-1.5"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#0F2334] text-white px-3 py-1.5 rounded font-semibold cursor-pointer"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingGuest(false)}
                      className="border border-stone-200 px-3 py-1.5 rounded cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Penempatan Kamar */}
            <div className="bg-white border border-stone-200/90 rounded-md p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-[#0F2334]">
                    Penempatan kamar
                  </h3>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                    Siap ditempati
                  </span>
                </div>

                <div>
                  <p className="font-serif text-3xl font-bold text-[#0F2334]">
                    {booking.roomNumber}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {booking.roomName.replace("Kamar ", "")} • Lantai{" "}
                    {booking.roomNumber.charAt(0) || "2"} • {booking.bedType}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Masuk</span>
                    <span className="font-medium text-[#0F2334]">
                      {formatShortDate(booking.checkIn)} · 14.00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Keluar</span>
                    <span className="font-medium text-[#0F2334]">
                      {formatShortDate(booking.checkOut)} · 12.00
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 pt-2">
                  Diperiksa housekeeping pukul 09.15 WIB. Kamar bersih &amp; siap.
                </p>
              </div>

              <div>
                <Link
                  href="/admin/kamar"
                  className="inline-block border border-stone-300 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-3.5 py-1.5 rounded transition"
                >
                  Ubah penempatan
                </Link>
              </div>
            </div>
          </div>

          {/* KARTU TAGIHAN & BUKU PEMBAYARAN */}
          <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-5">
            <h3 className="font-serif text-lg text-[#0F2334]">
              Tagihan &amp; buku pembayaran
            </h3>

            <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-3">
              <span className="text-stone-400">Paket</span>
              <span className="font-medium text-[#0F2334]">
                Fleksibel • Sarapan
              </span>
            </div>

            {/* Tabel Rincian Tagihan */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[10px] text-stone-500 uppercase">
                    <th className="py-2 px-3 font-semibold">Rincian</th>
                    <th className="py-2 px-3 font-semibold">Jumlah</th>
                    <th className="py-2 px-3 font-semibold">Tarif</th>
                    <th className="py-2 px-3 font-semibold text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="py-2.5 px-3 text-[#0F2334]">
                      {booking.roomName.replace("Kamar ", "")} •{" "}
                      {formatShortDate(booking.checkIn)}–
                      {formatDateFull(booking.checkOut)}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500">
                      {booking.nights} malam
                    </td>
                    <td className="py-2.5 px-3 text-stone-500">
                      Rp{booking.basePrice.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      Rp{booking.roomSubtotal.toLocaleString("id-ID")}
                    </td>
                  </tr>
                  {booking.discountAmount > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 text-emerald-700">
                        Diskon kode promo
                      </td>
                      <td className="py-2.5 px-3 text-stone-500">—</td>
                      <td className="py-2.5 px-3 text-stone-500">—</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700">
                        -Rp{booking.discountAmount.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5 px-3 text-[#0F2334]">
                      Pajak &amp; layanan
                    </td>
                    <td className="py-2.5 px-3 text-stone-500">11%</td>
                    <td className="py-2.5 px-3 text-stone-500">—</td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      Rp{booking.taxAmount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <span className="text-xs font-semibold text-[#0F2334]">
                Total tagihan
              </span>
              <span className="font-serif text-xl font-bold text-[#0F2334]">
                Rp{booking.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Riwayat Transaksi Pembayaran */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[10px] text-stone-500 uppercase">
                    <th className="py-2 px-3 font-semibold">Tanggal</th>
                    <th className="py-2 px-3 font-semibold">
                      Metode / referensi
                    </th>
                    <th className="py-2 px-3 font-semibold">Status</th>
                    <th className="py-2 px-3 font-semibold text-right">
                      Dibayar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="py-2.5 px-3 text-stone-500">
                      {formatDateTime(booking.paidAt || booking.createdAt)} WIB
                    </td>
                    <td className="py-2.5 px-3 text-[#0F2334]">
                      <span className="block font-medium">
                        {booking.paymentMethod}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {booking.bookingCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {booking.paymentStatus === "PAID" ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                          Berhasil
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                          Menunggu
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#0F2334]">
                      {booking.paymentStatus === "PAID"
                        ? `Rp${booking.totalAmount.toLocaleString("id-ID")}`
                        : "Rp0"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-500">Sisa pembayaran</span>
              <span className="font-bold text-[#0F2334]">
                Rp{remainingBalance.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="border border-stone-200 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-3.5 py-2 rounded transition cursor-pointer"
              >
                Unduh bukti pembayaran ↓
              </button>

              {booking.paymentStatus !== "PAID" &&
                booking.status !== "CANCELLED" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handlePatch({
                        paymentStatus: "PAID",
                        paymentMethod: "Resepsionis / Tunai",
                      })
                    }
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded transition cursor-pointer"
                  >
                    Konfirmasi pelunasan
                  </button>
                )}
            </div>
          </div>

          {/* KARTU PERMINTAAN & CATATAN INTERNAL */}
          <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
            <h3 className="font-serif text-lg text-[#0F2334]">
              Permintaan &amp; catatan internal
            </h3>

            <div className="bg-[#EEF2F6] border border-stone-200/80 rounded px-4 py-2.5 text-xs text-[#0F2334] flex items-center gap-2">
              <span>ⓘ</span>
              <span>
                Permintaan tamu:{" "}
                {booking.specialRequest ||
                  "kamar di lantai atas dan jauh dari lift, jika tersedia."}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-600">
                Catatan operasional
              </label>
              <textarea
                rows={3}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full border border-stone-200 rounded p-3 text-xs text-[#0F2334] focus:outline-none focus:border-[#0F2334]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-400">
                {noteSavedToast
                  ? "✓ Catatan berhasil disimpan ke database."
                  : "Hanya terlihat oleh tim hotel"}
              </span>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveNote}
                className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
              >
                Simpan catatan
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (4 KOLOM) */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Aktivitas Reservasi */}
          <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
            <h3 className="font-serif text-lg text-[#0F2334]">
              Aktivitas reservasi
            </h3>

            <div className="space-y-4 divide-y divide-stone-100 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-stone-400">
                  Hari ini • 09.30 WIB
                </span>
                <p className="font-semibold text-[#0F2334]">
                  Kamar {booking.roomNumber} ditetapkan
                </p>
                <p className="text-[11px] text-stone-500">
                  Rani Wulandari • Siap ditempati
                </p>
              </div>

              <div className="pt-3 space-y-0.5">
                <span className="text-[10px] text-stone-400">
                  {formatDateTime(booking.createdAt)} WIB
                </span>
                <p className="font-semibold text-[#0F2334]">
                  Konfirmasi terkirim
                </p>
                <p className="text-[11px] text-stone-500">
                  Email ke {booking.guestEmail}
                </p>
              </div>

              {booking.paymentStatus === "PAID" && (
                <div className="pt-3 space-y-0.5">
                  <span className="text-[10px] text-stone-400">
                    {formatDateTime(booking.paidAt || booking.createdAt)} WIB
                  </span>
                  <p className="font-semibold text-[#0F2334]">
                    Pembayaran berhasil
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {booking.paymentMethod} • Rp
                    {booking.totalAmount.toLocaleString("id-ID")}
                  </p>
                </div>
              )}

              <div className="pt-3 space-y-0.5">
                <span className="text-[10px] text-stone-400">
                  {formatDateTime(booking.createdAt)} WIB
                </span>
                <p className="font-semibold text-[#0F2334]">
                  Reservasi dibuat
                </p>
                <p className="text-[11px] text-stone-500">
                  Situs resmi • {booking.guestName}
                </p>
              </div>
            </div>
          </div>

          {/* Ketentuan Paket */}
          <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-3 text-xs">
            <h3 className="font-serif text-lg text-[#0F2334]">
              Ketentuan paket
            </h3>
            <p className="text-stone-500 leading-relaxed">
              Sarapan 2 orang termasuk. Pembatalan gratis hingga H-2 kedatangan
              pukul 18.00 WIB.
            </p>
            <p className="text-stone-500 leading-relaxed">
              Pembatalan terlambat atau tidak datang dikenakan 50% dari total
              tagihan.
            </p>

            {booking.status !== "CANCELLED" && (
              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handlePatch({ status: "CANCELLED" })}
                  className="text-red-600 hover:underline font-semibold cursor-pointer"
                >
                  Batalkan reservasi
                </button>
              </div>
            )}
          </div>

          {/* Info Layanan Tambahan */}
          <div className="bg-[#EEF2F6] border border-stone-200/80 rounded-md px-4 py-3 text-xs text-[#0F2334] flex items-center gap-2.5">
            <span>ⓘ</span>
            <span>Belum ada layanan tambahan pada reservasi ini.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}