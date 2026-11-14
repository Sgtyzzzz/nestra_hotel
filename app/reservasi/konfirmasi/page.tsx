"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface BookingDetail {
  bookingCode: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  arrivalTime: string | null;
  specialRequest: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  roomSubtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string | null;
  paymentRef: string | null;
  paidAt: string | null;
  room: {
    name: string;
    bedType: string;
    images: string[];
  };
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    const savedCode = sessionStorage.getItem("nestra_last_booking_code");
    const targetCode = codeFromUrl || savedCode || "NST-261016-0842";

    fetch(`/api/bookings/${targetCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setBooking(data);
        }
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const formatRupiah = (amount: number) =>
    "Rp" + amount.toLocaleString("id-ID");

  const formatDateIndo = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F2] text-xs text-stone-500">
        Memuat detail konfirmasi reservasi...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F6F2] gap-4">
        <p className="text-sm text-stone-600">Data reservasi tidak ditemukan.</p>
        <Link
          href="/kamar"
          className="bg-[#0F2334] text-white px-4 py-2 rounded text-xs"
        >
          Kembali pilih kamar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-[#1A202C]">
      {/* NAVBAR */}
      <header className="bg-white border-b border-stone-200 print:hidden">
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
            <Link href="/" className="hover:text-[#0F2334]">
              Beranda
            </Link>
            <Link href="/kamar" className="hover:text-[#0F2334]">
              Kamar
            </Link>
            <Link href="/fasilitas" className="hover:text-[#0F2334]">
              Fasilitas & pengalaman
            </Link>
            <Link href="/penawaran" className="hover:text-[#0F2334]">
              Penawaran
            </Link>
            <Link href="/kontak" className="hover:text-[#0F2334]">
              Hubungi kami
            </Link>
          </nav>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/reservasi-saya"
              className="hidden sm:inline text-stone-600 hover:text-[#0F2334]"
            >
              Reservasi saya
            </Link>
            <Link
              href="/kamar"
              className="bg-[#0F2334] text-white px-5 py-2.5 rounded text-xs font-medium"
            >
              Pesan kamar
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONFIRMATION CONTENT */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 space-y-6 flex-1">
        <div className="text-center space-y-3 pb-2">
          <div className="w-11 h-11 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center mx-auto text-lg font-bold">
            ✓
          </div>

          <h1 className="font-serif text-3xl md:text-4xl text-[#0F2334]">
            Sampai jumpa di Yogyakarta, {booking.guestFirstName}.
          </h1>

          <p className="text-xs text-stone-500">
            Reservasi Anda sudah dikonfirmasi. Kami menantikan kedatangan Anda.
          </p>

          <div className="pt-1">
            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium px-3 py-1 rounded">
              Dikonfirmasi • Pembayaran lunas
            </span>
          </div>
        </div>

        {/* EMAIL BANNER */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 px-4 py-3 rounded-md flex items-center gap-2.5 text-xs text-emerald-800">
          <span className="font-bold">✓</span>
          <span>
            Konfirmasi dan bukti pembayaran telah dikirim ke{" "}
            <span className="font-semibold">{booking.guestEmail}</span>.
          </span>
        </div>

        {/* CARD 1: NOMOR RESERVASI & KAMAR */}
        <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.15em] text-stone-400 font-semibold">
                NOMOR RESERVASI
              </span>
              <span className="text-lg font-bold tracking-wide text-[#0F2334] mt-0.5 block">
                {booking.bookingCode}
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="self-start sm:self-auto border border-stone-300 bg-white hover:bg-stone-50 text-[#0F2334] px-3.5 py-2 rounded text-xs font-medium transition inline-flex items-center gap-2 cursor-pointer print:hidden"
            >
              <span>Unduh konfirmasi</span>
              <span>↓</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            <div className="md:w-52 h-36 rounded overflow-hidden bg-stone-200 shrink-0">
              <img
                src={
                  booking.room.images?.[0] ||
                  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
                }
                alt={booking.room.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="pb-3 border-b border-stone-100">
                <h2 className="font-serif text-xl text-[#0F2334]">
                  Nestra Hotel Yogyakarta
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Jl. Mangkubumi No. 28, Gowongan, Jetis, Yogyakarta 55232
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    MASUK
                  </span>
                  <span className="block text-xs font-bold text-[#0F2334] mt-0.5">
                    {formatDateIndo(booking.checkIn)}
                  </span>
                  <span className="block text-[11px] text-stone-500">
                    Mulai 14.00 WIB
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    KELUAR
                  </span>
                  <span className="block text-xs font-bold text-[#0F2334] mt-0.5">
                    {formatDateIndo(booking.checkOut)}
                  </span>
                  <span className="block text-[11px] text-stone-500">
                    Sebelum 12.00 WIB
                  </span>
                </div>
              </div>

              <p className="text-[11px] font-medium text-stone-700 pt-1">
                {booking.room.name} • {booking.room.bedType} • {booking.adults}{" "}
                dewasa • {booking.nights} malam
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2 & 3: DATA TAMU & PEMBAYARAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-md border border-stone-200/90 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h2 className="font-serif text-lg text-[#0F2334]">Data tamu</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-stone-400">Nama tamu</span>
                  <span className="font-semibold text-[#0F2334]">
                    {booking.guestFirstName} {booking.guestLastName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-400">Ponsel</span>
                  <span className="font-semibold text-[#0F2334]">
                    {booking.guestPhone}
                  </span>
                </div>
                <div className="pt-0.5">
                  <span className="text-stone-500 text-[11px]">
                    Email: {booking.guestEmail}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-1.5">
              <span className="block text-[11px] font-semibold text-[#0F2334]">
                Permintaan khusus
              </span>
              <p className="text-xs text-stone-600">
                {booking.specialRequest || "Tidak ada permintaan khusus."}
              </p>
              <p className="text-[10px] text-stone-400">
                Perkiraan tiba: {booking.arrivalTime || "14.00 WIB"}.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-md border border-stone-200/90 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h2 className="font-serif text-lg text-[#0F2334]">
                Rincian pembayaran
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Kamar • {booking.nights} malam</span>
                  <span>{formatRupiah(booking.roomSubtotal)}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Potongan promo</span>
                    <span>-{formatRupiah(booking.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Pajak & layanan (11%)</span>
                  <span>{formatRupiah(booking.taxAmount)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <span className="text-xs font-semibold text-stone-700">
                  Total dibayar
                </span>
                <span className="font-serif text-lg font-bold text-[#0F2334]">
                  {formatRupiah(booking.totalAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div>
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-2.5 py-0.5 rounded">
                  Lunas • {booking.paymentMethod || "BCA Virtual Account"}
                </span>
              </div>
              <p className="text-[10px] text-stone-400">
                Referensi: {booking.paymentRef || booking.bookingCode}
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-4">
          <h2 className="font-serif text-lg text-[#0F2334]">
            Sebelum Anda berangkat
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Bawa KTP atau paspor yang masih berlaku. Sarapan untuk 2 orang
            tersedia di Restoran Serambi, pukul 06.30–10.00 WIB. Parkir tamu
            gratis.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3 print:hidden">
            <Link
              href="/reservasi-saya"
              className="bg-[#0F2334] hover:bg-[#19354d] text-white px-5 py-2.5 rounded text-xs font-medium transition"
            >
              Lihat reservasi saya
            </Link>
            <Link
              href="/kontak"
              className="border border-stone-300 bg-white hover:bg-stone-50 text-[#0F2334] px-4 py-2.5 rounded text-xs font-medium transition"
            >
              Hubungi hotel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-10 text-xs">Memuat...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}