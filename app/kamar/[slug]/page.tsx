"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface RoomDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  basePrice: number;
  sizeSqm: number;
  maxGuests: number;
  bedType: string;
  viewType: string;
  amenities: string[];
  images: string[];
}

export default function RoomDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [checkIn, setCheckIn] = useState("2026-10-16");
  const [checkOut, setCheckOut] = useState("2026-10-18");
  const [adults, setAdults] = useState(2);

  useEffect(() => {
    if (!params?.slug) return;

    fetch(`/api/rooms/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setRoom(data);
        }
      })
      .finally(() => setLoading(false));
  }, [params?.slug]);

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const formatRupiah = (amount: number) =>
    "Rp" + amount.toLocaleString("id-ID");

  const handleProceedToCheckout = () => {
    if (!room) return;

    const existing = sessionStorage.getItem("nestra_booking_guest");
    const parsed = existing ? JSON.parse(existing) : {};

    sessionStorage.setItem(
      "nestra_booking_guest",
      JSON.stringify({
        ...parsed,
        roomSlug: room.slug,
        roomName: room.name,
        basePrice: room.basePrice,
        checkIn,
        checkOut,
        nights,
        adults,
      })
    );

    router.push("/reservasi/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F2] text-xs text-stone-500">
        Memuat detail kamar...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F6F2] gap-4">
        <p className="text-sm text-stone-600">Kamar tidak ditemukan.</p>
        <Link
          href="/kamar"
          className="bg-[#0F2334] text-white px-4 py-2 rounded text-xs"
        >
          Kembali ke daftar kamar
        </Link>
      </div>
    );
  }

  const gallery =
    room.images && room.images.length > 0
      ? room.images
      : [
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
        ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-[#1A202C]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
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
            <Link href="/kamar" className="text-[#0F2334] font-semibold">
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

          <Link
            href="/reservasi-saya"
            className="text-xs text-stone-600 hover:text-[#0F2334]"
          >
            Reservasi saya
          </Link>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="max-w-6xl w-full mx-auto px-6 pt-6 text-xs text-stone-500">
        <Link href="/kamar" className="hover:text-[#0F2334]">
          ← Kembali ke semua kamar
        </Link>
      </div>

      {/* GALLERY */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-5 space-y-3">
        <div className="w-full h-72 md:h-[420px] rounded-md overflow-hidden bg-stone-200">
          <img
            src={gallery[activeImage] || gallery[0]}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-3">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(idx)}
                className={`w-24 h-16 rounded overflow-hidden border-2 cursor-pointer ${
                  activeImage === idx
                    ? "border-[#0F2334]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`${room.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* DETAIL & BOOKING WIDGET */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start flex-1">
        {/* LEFT: DESCRIPTION & AMENITIES */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3 pb-6 border-b border-stone-200">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#9A7B4F] font-semibold">
              {room.tagline}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#0F2334]">
              {room.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-1">
              <span>Luas {room.sizeSqm} m²</span>
              <span>•</span>
              <span>Maks. {room.maxGuests} tamu</span>
              <span>•</span>
              <span>{room.bedType}</span>
              <span>•</span>
              <span>{room.viewType}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-xl text-[#0F2334]">Tentang kamar</h2>
            <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
              {room.description}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl text-[#0F2334]">
              Fasilitas kamar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
              {room.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200/80 px-4 py-3 rounded flex items-center gap-2.5"
                >
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: RESERVATION CARD */}
        <aside className="lg:col-span-5 bg-white p-6 rounded-md border border-stone-200/90 space-y-5 sticky top-28">
          <div className="pb-4 border-b border-stone-100">
            <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              HARGA PER MALAM
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-serif text-2xl font-bold text-[#0F2334]">
                {formatRupiah(room.basePrice)}
              </span>
              <span className="text-xs text-stone-500">/ malam</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#0F2334]">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#0F2334]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#0F2334]">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#0F2334]"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-[11px] font-semibold text-[#0F2334]">
              Jumlah tamu
            </label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full border border-stone-200 rounded px-3 py-2 bg-white text-xs focus:outline-none focus:border-[#0F2334]"
            >
              {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map(
                (num) => (
                  <option key={num} value={num}>
                    {num} Dewasa
                  </option>
                )
              )}
            </select>
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>
                {formatRupiah(room.basePrice)} × {nights} malam
              </span>
              <span>{formatRupiah(room.basePrice * nights)}</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Pajak & kode promo dapat diterapkan pada langkah pembayaran.
            </p>
          </div>

          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="w-full bg-[#0F2334] hover:bg-[#19354d] text-white py-3.5 rounded text-xs font-semibold transition cursor-pointer"
          >
            Pesan kamar ini
          </button>
        </aside>
      </main>
    </div>
  );
}