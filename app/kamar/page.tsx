"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface RoomItem {
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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuests, setSelectedGuests] = useState<number>(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(3000000);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc">("price-asc");

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRooms(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatRupiah = (amount: number) =>
    "Rp" + amount.toLocaleString("id-ID");

  const filteredRooms = rooms
    .filter((room) => {
      const matchGuests =
        selectedGuests === 0 || room.maxGuests >= selectedGuests;
      const matchPrice = room.basePrice <= maxPriceFilter;
      return matchGuests && matchPrice;
    })
    .sort((a, b) =>
      sortBy === "price-asc"
        ? a.basePrice - b.basePrice
        : b.basePrice - a.basePrice
    );

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
            <Link href="/" className="hover:text-[#0F2334] transition">
              Beranda
            </Link>
            <Link
              href="/kamar"
              className="text-[#0F2334] font-semibold transition"
            >
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
              href="/reservasi-saya"
              className="hidden sm:inline text-stone-600 hover:text-[#0F2334] transition"
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

      {/* PAGE HEADER */}
      <section className="bg-white border-b border-stone-200/80 py-14">
        <div className="max-w-6xl mx-auto px-6 space-y-3">
          <span className="block text-[11px] uppercase tracking-[0.2em] text-[#9A7B4F] font-semibold">
            KOLEKSI KAMAR & SUITE
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#0F2334]">
            Ruang tenang dengan sentuhan kayu jati dan cahaya alami.
          </h1>
          <p className="text-xs md:text-sm text-stone-500 max-w-2xl leading-relaxed">
            Setiap kamar dirancang untuk memberi jeda setelah menjelajahi
            sudut-sudut Yogyakarta, lengkap dengan sarapan pagi untuk dua orang.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="bg-white border-b border-stone-200 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-stone-500">Kapasitas:</span>
              <select
                value={selectedGuests}
                onChange={(e) => setSelectedGuests(Number(e.target.value))}
                className="border border-stone-200 rounded px-3 py-1.5 bg-white text-[#0F2334] font-medium focus:outline-none"
              >
                <option value={0}>Semua kapasitas</option>
                <option value={2}>Minimal 2 tamu</option>
                <option value={4}>Keluarga (4 tamu)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-500">Batas harga:</span>
              <select
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="border border-stone-200 rounded px-3 py-1.5 bg-white text-[#0F2334] font-medium focus:outline-none"
              >
                <option value={3000000}>Semua harga</option>
                <option value={750000}>Maks. Rp750.000 / malam</option>
                <option value={1000000}>Maks. Rp1.000.000 / malam</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "price-asc" | "price-desc")
              }
              className="border border-stone-200 rounded px-3 py-1.5 bg-white text-[#0F2334] font-medium focus:outline-none"
            >
              <option value="price-asc">Harga terendah</option>
              <option value="price-desc">Harga tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* ROOM LISTINGS */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1">
        {loading ? (
          <div className="bg-white p-10 rounded-md border border-stone-200 text-center text-xs text-stone-500">
            Memuat daftar kamar dari database...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white p-10 rounded-md border border-stone-200 text-center space-y-3">
            <p className="text-xs text-stone-500">
              Tidak ada kamar yang sesuai dengan filter pilihan Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedGuests(0);
                setMaxPriceFilter(3000000);
              }}
              className="border border-[#0F2334] text-[#0F2334] px-4 py-2 rounded text-xs font-medium cursor-pointer"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRooms.map((room) => (
              <article
                key={room.id}
                className="bg-white rounded-md border border-stone-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
              >
                {/* Room Image */}
                <div className="lg:col-span-5 h-64 lg:h-auto bg-stone-200 relative">
                  <img
                    src={
                      room.images?.[0] ||
                      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Room Details */}
                <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                      <span>{room.sizeSqm} m²</span>
                      <span>•</span>
                      <span>Maks. {room.maxGuests} tamu</span>
                      <span>•</span>
                      <span>{room.bedType}</span>
                      <span>•</span>
                      <span>{room.viewType}</span>
                    </div>

                    <h2 className="font-serif text-2xl md:text-3xl text-[#0F2334]">
                      {room.name}
                    </h2>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {room.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {room.amenities.slice(0, 4).map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-[#F8F6F2] border border-stone-200/80 text-stone-600 text-[11px] px-2.5 py-1 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        MULAI DARI
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-serif text-2xl font-bold text-[#0F2334]">
                          {formatRupiah(room.basePrice)}
                        </span>
                        <span className="text-xs text-stone-500">/ malam</span>
                      </div>
                      <span className="block text-[11px] text-emerald-700 mt-0.5">
                        Termasuk sarapan 2 orang
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/kamar/${room.slug}`}
                        className="border border-stone-300 hover:border-[#0F2334] text-[#0F2334] px-4 py-2.5 rounded text-xs font-medium transition"
                      >
                        Detail kamar
                      </Link>
                      <Link
                        href={`/kamar/${room.slug}`}
                        className="bg-[#0F2334] hover:bg-[#19354d] text-white px-5 py-2.5 rounded text-xs font-semibold transition"
                      >
                        Pilih kamar
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0F2334] text-stone-300 py-10 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="font-serif text-white text-sm">
            Nestra Hotel Yogyakarta
          </p>
          <p className="text-stone-400">
            © 2026 Nestra Hotel. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}