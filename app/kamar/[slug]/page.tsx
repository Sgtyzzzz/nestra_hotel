"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

const ROOM_IMAGES_BY_CATEGORY: Record<string, string> = {
  DELUXE:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
  SUPERIOR:
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
  SUITE:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  DEFAULT:
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
};

interface RoomDetail {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  sizeSqm: number;
  maxGuests: number;
  bedType: string;
  viewType: string;
  basePrice: number;
  imageUrl?: string | null;
  amenities: string[];
  remainingRooms?: number;
  isFull?: boolean;
}

function RoomDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = String(params?.slug || "");

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(
    searchParams.get("checkIn") || "2026-10-16"
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get("checkOut") || "2026-10-18"
  );
  const [guests, setGuests] = useState(searchParams.get("guests") || "2");

  useEffect(() => {
    if (!slug) return;
    const loadRoom = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/rooms");
        if (res.ok) {
          const allRooms: RoomDetail[] = await res.json();
          const matched = allRooms.find((item) => item.slug === slug) || null;
          setRoom(matched);
        }
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [slug]);

  const isFull = Boolean(room?.isFull);
  const fallbackImg =
    ROOM_IMAGES_BY_CATEGORY[room?.category?.toUpperCase() || ""] ||
    ROOM_IMAGES_BY_CATEGORY.DEFAULT;
  const imageSrc =
    room?.imageUrl && room.imageUrl.trim() !== "" ? room.imageUrl : fallbackImg;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F2334] flex flex-col font-sans">
      {/* NAVBAR */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-[#C6A267] text-[#0F2334] flex items-center justify-center font-serif font-bold text-lg">
              N
            </div>
            <div className="leading-none">
              <span className="block font-bold tracking-[0.16em] text-xs text-[#0F2334]">
                NESTRA
              </span>
              <span className="text-[9px] tracking-[0.22em] text-stone-500">
                HOTEL
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-stone-600">
            <Link href="/" className="hover:text-[#0F2334]">
              Beranda
            </Link>
            <Link href="/kamar" className="text-[#0F2334] font-semibold">
              Kamar
            </Link>
            <Link href="/fasilitas" className="hover:text-[#0F2334]">
              Fasilitas &amp; pengalaman
            </Link>
            <Link href="/penawaran" className="hover:text-[#0F2334]">
              Penawaran
            </Link>
            <Link href="/kontak" className="hover:text-[#0F2334]">
              Hubungi kami
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/reservasi/reservasi-saya"
              className="hidden sm:inline text-xs font-medium text-stone-600 hover:text-[#0F2334]"
            >
              Reservasi saya
            </Link>
            <Link
              href="/reservasi/checkout"
              className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-4 py-2 rounded transition"
            >
              Pesan kamar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        {loading ? (
          <div className="bg-white border border-stone-200 rounded-md p-12 text-center text-xs text-stone-500">
            Memuat detail kamar...
          </div>
        ) : !room ? (
          <div className="bg-white border border-stone-200 rounded-md p-12 text-center space-y-3">
            <p className="font-serif text-2xl text-[#0F2334]">
              Kamar tidak ditemukan
            </p>
            <Link
              href="/kamar"
              className="inline-block bg-[#0F2334] text-white text-xs px-4 py-2 rounded"
            >
              Kembali ke daftar kamar
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <Link href="/" className="hover:text-[#0F2334]">
                Beranda
              </Link>
              <span>/</span>
              <Link href="/kamar" className="hover:text-[#0F2334]">
                Kamar &amp; harga
              </Link>
              <span>/</span>
              <span className="text-stone-600">{room.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-stone-200 border border-stone-200">
                  <img
                    src={imageSrc}
                    alt={room.name}
                    onError={(e) => {
                      if (e.currentTarget.src !== fallbackImg) {
                        e.currentTarget.src = fallbackImg;
                      }
                    }}
                    className={`w-full h-full object-cover ${
                      isFull ? "grayscale opacity-65" : ""
                    }`}
                  />

                  {isFull && (
                    <div className="absolute inset-0 bg-[#0F2334]/70 flex items-center justify-center">
                      <div className="border border-white/80 bg-red-600 text-white px-6 py-2 rounded text-center">
                        <span className="text-sm font-bold tracking-[0.22em] uppercase">
                          SEDANG PENUH
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-stone-200 rounded-md p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="uppercase tracking-widest font-bold text-[#9A7840]">
                      {room.category}
                    </span>
                    {isFull ? (
                      <span className="bg-red-50 text-red-700 border border-red-200 font-semibold px-2.5 py-0.5 rounded">
                        Sedang penuh
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 font-medium px-2.5 py-0.5 rounded">
                        Tersisa {room.remainingRooms ?? 3} kamar
                      </span>
                    )}
                  </div>

                  <h1 className="font-serif text-3xl text-[#0F2334]">
                    {room.name}
                  </h1>

                  <p className="text-xs text-stone-500">
                    {room.sizeSqm} m² • Maks. {room.maxGuests} tamu •{" "}
                    {room.bedType} • {room.viewType}
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {room.description}
                  </p>

                  <div className="pt-2">
                    <h2 className="text-xs font-bold text-[#0F2334] mb-2.5">
                      Fasilitas di dalam kamar
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities?.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-[#FAF7F2] border border-stone-200 text-stone-700 px-3 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* KARTU RESERVASI KANAN */}
              <aside className="lg:col-span-4 bg-white border border-stone-200 rounded-md p-6 space-y-4 sticky top-24">
                <div>
                  <span className="block text-[10px] text-stone-400">
                    Harga per malam
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#0F2334]">
                      Rp{room.basePrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-stone-500">/ malam</span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    Termasuk sarapan pagi &amp; pajak
                  </span>
                </div>

                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-[10px] font-medium text-stone-400 mb-1">
                      Tanggal masuk
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full border border-stone-200 rounded px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-stone-400 mb-1">
                      Tanggal keluar
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border border-stone-200 rounded px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-stone-400 mb-1">
                      Jumlah tamu
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white"
                    >
                      <option value="1">1 dewasa</option>
                      <option value="2">2 dewasa</option>
                      <option value="3">3 dewasa</option>
                      <option value="4">4 dewasa</option>
                    </select>
                  </div>
                </div>

                {isFull ? (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-stone-300 text-stone-600 text-xs font-semibold py-2.5 px-4 rounded cursor-not-allowed"
                  >
                    Kamar sedang penuh
                  </button>
                ) : (
                  <Link
                    href={`/reservasi/checkout?room=${room.slug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                    className="block text-center w-full bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold py-2.5 px-4 rounded transition"
                  >
                    Lanjutkan pemesanan →
                  </Link>
                )}
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0F2334] text-white pt-14 pb-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2.5">
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
              </div>
              <p className="font-serif italic text-sm text-[#E5C687]">
                Your Stay, Made Simple.
              </p>
              <p className="text-[11px] text-stone-300 leading-relaxed max-w-xs">
                Ruang nyaman, keramahan tulus, dan Yogyakarta yang selalu dekat.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2">
              <p className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Temukan kami
              </p>
              <p className="text-[11px] text-stone-300">
                Jl. Mangkubumi No. 28, Gowongan, Jetis, Yogyakarta 55232
              </p>
              <p className="text-[11px] text-stone-300">+62 274 555 0198</p>
              <p className="text-[11px] text-stone-300">halo@nestrahotel.id</p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <p className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Jelajahi Nestra
              </p>
              <ul className="space-y-1.5 text-[11px] text-stone-300">
                <li>
                  <Link href="/kamar" className="hover:text-white">
                    Kamar &amp; harga
                  </Link>
                </li>
                <li>
                  <Link href="/fasilitas" className="hover:text-white">
                    Fasilitas &amp; pengalaman
                  </Link>
                </li>
                <li>
                  <Link href="/penawaran" className="hover:text-white">
                    Penawaran menginap
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white">
                    Hubungi kami
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-2">
              <p className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Bantuan tamu
              </p>
              <ul className="space-y-1.5 text-[11px] text-stone-300">
                <li>
                  <Link
                    href="/reservasi/reservasi-saya"
                    className="hover:text-white"
                  >
                    Reservasi saya
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white">
                    Pertanyaan umum
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white">
                    Kebijakan pembatalan
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white">
                    Syarat &amp; ketentuan
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-stone-400">
            <span>© 2026 Nestra Hotel. Seluruh hak cipta dilindungi.</span>
            <span>Kebijakan privasi • Bahasa Indonesia • IDR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RoomDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs text-stone-500">
          Memuat halaman detail kamar...
        </div>
      }
    >
      <RoomDetailContent />
    </Suspense>
  );
}