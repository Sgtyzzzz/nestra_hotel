"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface RoomDetail {
  id: string;
  slug: string;
  name: string;
  category: string;
  bedType: string;
  basePrice: number;
  imageUrl?: string | null;
}

const FALLBACK_ROOM_IMAGES: Record<string, string> = {
  DELUXE:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  SUPERIOR:
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
  SUITE:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  DEFAULT:
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80",
};

function getLocalDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateID(dateStr: string) {
  if (!dateStr) return "-";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${months[m - 1]} ${y}`;
}

function getCancellationDateID(checkInStr: string) {
  if (!checkInStr) return "-";
  const d = new Date(`${checkInStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return checkInStr;
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return formatDateID(`${year}-${month}-${day}`);
}

function CheckoutGuestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomSlugParam = searchParams.get("room") || "deluks";
  const initialCheckIn =
    searchParams.get("checkIn") || getLocalDateString(0);
  const initialCheckOut =
    searchParams.get("checkOut") || getLocalDateString(1);
  const guestsParam = searchParams.get("guests") || "2";

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "Indonesia (+62)",
    phone: "",
    isSameGuest: true,
    guestFullName: "",
    arrivalTime: "14.00–15.00 WIB",
    guestCount: `${guestsParam} dewasa • 0 anak`,
    specialRequest: "",
    needCompanyInvoice: false,
    companyName: "",
    companyTaxId: "",
  });

  useEffect(() => {
    setCheckIn(searchParams.get("checkIn") || getLocalDateString(0));
    setCheckOut(searchParams.get("checkOut") || getLocalDateString(1));
    const g = searchParams.get("guests");
    if (g) {
      setFormData((prev) => ({
        ...prev,
        guestCount: `${g} dewasa • 0 anak`,
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const matched =
            data.find(
              (item: RoomDetail) =>
                item.slug.toLowerCase() === roomSlugParam.toLowerCase() ||
                item.name.toLowerCase().includes(roomSlugParam.toLowerCase())
            ) || data[0];
          setRoom(matched);
        }
      })
      .catch(() => {});
  }, [roomSlugParam]);

  const nights = (() => {
    const start = new Date(`${checkIn}T00:00:00`).getTime();
    const end = new Date(`${checkOut}T00:00:00`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  })();

  const basePrice = room?.basePrice ?? 850000;
  const subtotal = basePrice * nights;
  const taxAmount = Math.round(subtotal * 0.11);
  const totalAmount = subtotal + taxAmount;

  const fallbackImg =
    FALLBACK_ROOM_IMAGES[room?.category?.toUpperCase() || ""] ||
    FALLBACK_ROOM_IMAGES.DEFAULT;
  const roomImage =
    room?.imageUrl && room.imageUrl.trim() !== "" ? room.imageUrl : fallbackImg;

  const isContactComplete =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.includes("@") &&
    formData.phone.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isContactComplete) return;

    const checkoutPayload = {
      ...formData,
      roomId: room?.id || "",
      roomSlug: room?.slug || roomSlugParam,
      roomName: room?.name || "Kamar Deluks",
      bedType: room?.bedType || "Ranjang besar",
      basePrice,
      checkIn,
      checkOut,
      nights,
      subtotal,
      taxAmount,
      totalAmount,
    };

    sessionStorage.setItem(
      "nestra_booking_guest",
      JSON.stringify(checkoutPayload)
    );
    router.push(
      `/reservasi/pembayaran?room=${room?.slug || roomSlugParam}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestsParam}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-[#1A202C]">
      {/* 1. NAVBAR */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0F2334] text-white flex items-center justify-center font-serif font-bold text-lg rounded-sm">
              N
            </div>
            <div className="leading-none">
              <span className="block font-bold tracking-wider text-sm text-[#0F2334]">
                NESTRA
              </span>
              <span className="text-[10px] tracking-[0.2em] text-stone-500">
                HOTEL
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-600">
            <Link href="/" className="hover:text-[#0F2334] transition">
              Beranda
            </Link>
            <Link href="/kamar" className="text-[#0F2334] font-semibold">
              Kamar
            </Link>
            <Link href="/fasilitas" className="hover:text-[#0F2334] transition">
              Fasilitas & pengalaman
            </Link>
            <Link href="/penawaran" className="hover:text-[#0F2334] transition">
              Penawaran
            </Link>
            <Link href="/kontak" className="hover:text-[#0F2334] transition">
              Hubungi kami
            </Link>
          </nav>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/reservasi/reservasi-saya"
              className="hidden sm:inline text-stone-600 hover:text-[#0F2334]"
            >
              Reservasi saya
            </Link>
            <Link
              href="/kamar"
              className="bg-[#0F2334] hover:bg-[#19354d] text-white px-5 py-2.5 rounded text-xs font-medium transition"
            >
              Pesan kamar
            </Link>
          </div>
        </div>
      </header>

      {/* 2. STEPPER PROGRESS BAR */}
      <div className="bg-white border-b border-stone-200 py-4">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="w-6 h-6 rounded-full bg-[#0F2334] text-white flex items-center justify-center text-[11px] font-bold">
              ✓
            </span>
            <span className="hidden sm:inline">Pilih kamar</span>
          </div>

          <div className="h-[1px] flex-1 bg-stone-200 mx-3" />

          <div className="flex items-center gap-2 font-semibold text-[#0F2334]">
            <span className="w-6 h-6 rounded-full bg-[#0F2334] text-white flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>Data tamu</span>
          </div>

          <div className="h-[1px] flex-1 bg-stone-200 mx-3" />

          <div className="flex items-center gap-2 text-stone-400">
            <span className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center text-[11px] font-medium">
              3
            </span>
            <span className="hidden sm:inline">Pembayaran</span>
          </div>

          <div className="h-[1px] flex-1 bg-stone-200 mx-3" />

          <div className="flex items-center gap-2 text-stone-400">
            <span className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center text-[11px] font-medium">
              4
            </span>
            <span className="hidden sm:inline">Konfirmasi</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* LEFT FORM COLUMN (8 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#0F2334]">
              Siapa yang akan menginap?
            </h1>
            <p className="text-xs text-stone-500 mt-1.5">
              Lengkapi data Anda. Konfirmasi dan informasi menginap akan dikirim
              melalui email.
            </p>
          </div>

          <div className="bg-[#EEF2F5] px-4 py-3 rounded-md border border-slate-200/80 flex items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 font-bold">ⓘ</span>
              <p>
                Sudah punya akun? Masuk untuk mengisi data lebih cepat dan
                menyimpan reservasi Anda.
              </p>
            </div>
            <Link
              href="/login"
              className="text-[#0F2334] font-semibold hover:underline shrink-0"
            >
              Masuk
            </Link>
          </div>

          {/* CARD 1: DATA PEMESAN */}
          <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-5">
            <div>
              <h2 className="font-serif text-xl text-[#0F2334]">
                Data pemesan
              </h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Kolom bertanda * wajib diisi. Gunakan nama sesuai kartu identitas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Nama depan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Contoh: Aditya"
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Nama belakang *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Contoh: Pratama"
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                Alamat email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="nama@email.com"
                className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
              />
              <span className="block text-[10px] text-stone-400 mt-1">
                Konfirmasi reservasi dikirim ke alamat ini.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Kode negara
                </label>
                <select
                  value={formData.countryCode}
                  onChange={(e) =>
                    setFormData({ ...formData, countryCode: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 bg-white focus:outline-none focus:border-[#0F2334]"
                >
                  <option>Indonesia (+62)</option>
                  <option>Singapura (+65)</option>
                  <option>Malaysia (+60)</option>
                </select>
              </div>
              <div className="sm:col-span-7">
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Nomor ponsel *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="812 3456 7890"
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                />
                <span className="block text-[10px] text-stone-400 mt-1">
                  Nomor aktif untuk informasi kedatangan.
                </span>
              </div>
            </div>

            <div className="pt-1 space-y-3">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSameGuest}
                  onChange={(e) =>
                    setFormData({ ...formData, isSameGuest: e.target.checked })
                  }
                  className="accent-[#0F2334] rounded"
                />
                <span>Saya adalah tamu yang akan menginap</span>
              </label>

              {!formData.isSameGuest && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                    Nama lengkap tamu yang menginap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guestFullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guestFullName: e.target.value,
                      })
                    }
                    placeholder="Masukkan nama lengkap tamu"
                    className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                  />
                </div>
              )}
            </div>

            {isContactComplete ? (
              <div className="bg-emerald-50/80 border border-emerald-200/80 px-4 py-3 rounded flex items-center gap-2.5 text-xs text-emerald-800">
                <span className="font-bold">✓</span>
                <span>
                  Data kontak lengkap. Anda dapat melanjutkan ke pembayaran.
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded flex items-center gap-2.5 text-xs text-amber-800">
                <span className="font-bold">!</span>
                <span>
                  Lengkapi seluruh kolom bertanda * untuk melanjutkan.
                </span>
              </div>
            )}
          </div>

          {/* CARD 2: PREFERENSI MENGINAP */}
          <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-5">
            <h2 className="font-serif text-xl text-[#0F2334]">
              Preferensi menginap
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Perkiraan kedatangan
                </label>
                <select
                  value={formData.arrivalTime}
                  onChange={(e) =>
                    setFormData({ ...formData, arrivalTime: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 bg-white focus:outline-none focus:border-[#0F2334]"
                >
                  <option>14.00–15.00 WIB</option>
                  <option>15.00–18.00 WIB</option>
                  <option>18.00–21.00 WIB</option>
                  <option>Setelah 21.00 WIB</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Jumlah tamu
                </label>
                <select
                  value={formData.guestCount}
                  onChange={(e) =>
                    setFormData({ ...formData, guestCount: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 bg-white focus:outline-none focus:border-[#0F2334]"
                >
                  <option>1 dewasa • 0 anak</option>
                  <option>2 dewasa • 0 anak</option>
                  <option>2 dewasa • 1 anak</option>
                  <option>3 dewasa • 0 anak</option>
                  <option>4 dewasa • 0 anak</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                Permintaan khusus (opsional)
              </label>
              <textarea
                rows={3}
                value={formData.specialRequest}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequest: e.target.value })
                }
                placeholder="Contoh: Kamar di lantai atas dan jauh dari lift, jika tersedia."
                className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
              />
              <span className="block text-[10px] text-stone-400 mt-1">
                Permintaan bergantung pada ketersediaan dan tidak dapat dijamin.
              </span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needCompanyInvoice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      needCompanyInvoice: e.target.checked,
                    })
                  }
                  className="accent-[#0F2334] rounded"
                />
                <span>Saya memerlukan faktur atas nama perusahaan</span>
              </label>

              {formData.needCompanyInvoice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <input
                    type="text"
                    placeholder="Nama perusahaan"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                  />
                  <input
                    type="text"
                    placeholder="NPWP (opsional)"
                    value={formData.companyTaxId}
                    onChange={(e) =>
                      setFormData({ ...formData, companyTaxId: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Terms & Bottom Navigation */}
          <div className="space-y-4 pt-1">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Dengan melanjutkan, Anda menyetujui syarat & ketentuan reservasi
              dan kebijakan privasi Nestra Hotel. Data hanya digunakan untuk
              kebutuhan menginap Anda.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href={`/kamar/${room?.slug || roomSlugParam}`}
                className="text-xs font-medium text-stone-600 hover:text-[#0F2334] inline-flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Kembali ke kamar</span>
              </Link>

              <button
                type="submit"
                disabled={!isContactComplete}
                className="bg-[#0F2334] hover:bg-[#19354d] disabled:bg-stone-300 text-white px-6 py-3 rounded text-xs font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke pembayaran</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </form>

        {/* RIGHT SIDEBAR: RINGKASAN MENGINAP (4 Cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-md border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif text-lg text-[#0F2334]">
              Ringkasan menginap
            </h2>

            <div className="h-32 rounded overflow-hidden bg-stone-200">
              <img
                src={roomImage}
                alt={room?.name || "Ringkasan Kamar"}
                onError={(e) => {
                  if (e.currentTarget.src !== fallbackImg) {
                    e.currentTarget.src = fallbackImg;
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#0F2334]">
                Nestra Hotel Yogyakarta
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {room?.name || "Memuat kamar..."} •{" "}
                {room?.bedType || "Ranjang besar"}
              </p>
              <p className="text-[11px] text-stone-500">
                {formData.guestCount.split("•")[0].trim()} • 1 kamar • {nights}{" "}
                malam
              </p>
            </div>

            {/* Check-in / Check-out (Bisa diubah juga langsung dari ringkasan) */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-stone-400">Masuk</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCheckIn(val);
                      if (val && checkOut && val >= checkOut) {
                        const next = new Date(`${val}T00:00:00`);
                        next.setDate(next.getDate() + 1);
                        setCheckOut(next.toISOString().slice(0, 10));
                      }
                    }}
                    className="border border-stone-200 rounded px-2 py-1 text-[11px] font-medium text-stone-800"
                  />
                  <span className="text-[11px] text-stone-500">14.00</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-stone-400">Keluar</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="border border-stone-200 rounded px-2 py-1 text-[11px] font-medium text-stone-800"
                  />
                  <span className="text-[11px] text-stone-500">12.00</span>
                </div>
              </div>
              <div className="pt-1">
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded">
                  Sarapan untuk 2 orang
                </span>
              </div>
            </div>

            {/* Rincian Biaya */}
            <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>
                  Rp{basePrice.toLocaleString("id-ID")} × {nights} malam
                </span>
                <span>Rp{subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Pajak & layanan (11%)</span>
                <span>Rp{taxAmount.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-stone-200">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-stone-700">
                  Total pembayaran
                </span>
                <span className="font-serif text-xl font-bold text-[#0F2334]">
                  Rp{totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Harga dalam Rupiah. Tidak ada biaya tersembunyi.
              </p>
            </div>

            <p className="text-[10px] text-emerald-700 font-medium pt-1 border-t border-stone-100">
              Pembatalan gratis hingga {getCancellationDateID(checkIn)}, 18.00
              WIB.
            </p>
          </div>

          <div className="bg-white p-5 rounded-md border border-stone-200/90 space-y-1.5">
            <h3 className="font-serif text-base text-[#0F2334]">
              Bantuan reservasi
            </h3>
            <p className="text-[11px] text-stone-500">
              Tim kami siap membantu 24 jam.
            </p>
            <p className="text-xs font-semibold text-[#0F2334] pt-1">
              +62 274 582 100 • halo@nestrahotel.id
            </p>
          </div>
        </aside>
      </main>

      {/* 4. COMPACT FOOTER */}
      <footer className="bg-[#0F2334] text-stone-400 py-5 text-[11px] mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Nestra Hotel. Semua hak dilindungi.</p>
          <div className="flex gap-3">
            <span>Kebijakan privasi</span>
            <span>•</span>
            <span>Bahasa Indonesia</span>
            <span>•</span>
            <span>IDR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutGuestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center text-xs text-stone-500">
          Memuat halaman checkout...
        </div>
      }
    >
      <CheckoutGuestContent />
    </Suspense>
  );
}