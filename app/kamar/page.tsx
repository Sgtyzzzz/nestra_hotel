"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ROOM_IMAGES_BY_CATEGORY: Record<string, string> = {
  DELUXE:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  SUPERIOR:
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
  SUITE:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  DEFAULT:
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80",
};

interface RoomItem {
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

function RoomsCatalogContent() {
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState(
    searchParams.get("checkIn") || "2026-10-16"
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get("checkOut") || "2026-10-18"
  );
  const [guests, setGuests] = useState(searchParams.get("guests") || "2");

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBed, setSelectedBed] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState(1250000);
  const [sortBy, setSortBy] = useState("recommended");

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedBed !== "ALL") params.set("bedType", selectedBed);
      params.set("maxPrice", String(maxPrice));
      params.set("sort", sortBy);

      const res = await fetch(`/api/rooms?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedCategory, selectedBed, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedBed("ALL");
    setMaxPrice(1250000);
    setSortBy("recommended");
  };

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

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
        {/* BREADCRUMB & JUDUL */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#0F2334]">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-stone-600">Kamar &amp; harga</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl text-[#0F2334]">
            Tiga cara untuk beristirahat di Yogyakarta.
          </h1>
          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            Seluruh kamar sudah termasuk sarapan pagi untuk 2 tamu, Wi-Fi cepat,
            air mineral isi ulang, serta pembatalan gratis hingga 24 jam sebelum
            check-in.
          </p>
        </div>

        {/* SEARCH BAR HORIZONTAL */}
        <div className="bg-white border border-stone-200/90 rounded-md p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-medium text-stone-400 mb-1">
              Tanggal masuk
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full border border-stone-200 rounded px-3 py-2 text-xs text-[#0F2334]"
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
              className="w-full border border-stone-200 rounded px-3 py-2 text-xs text-[#0F2334]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-stone-400 mb-1">
              Tamu
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full border border-stone-200 rounded px-3 py-2 text-xs text-[#0F2334] bg-white"
            >
              <option value="1">1 dewasa</option>
              <option value="2">2 dewasa</option>
              <option value="3">3 dewasa</option>
              <option value="4">4 dewasa</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-stone-400 mb-1">
              Tipe kamar
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-stone-200 rounded px-3 py-2 text-xs text-[#0F2334] bg-white"
            >
              <option value="ALL">Semua tipe kamar</option>
              <option value="SUPERIOR">Superior</option>
              <option value="DELUXE">Deluxe</option>
              <option value="SUITE">Suite</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchRooms}
            className="w-full bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold py-2.5 px-4 rounded transition cursor-pointer"
          >
            Perbarui pencarian
          </button>
        </div>

        {/* LAYOUT 2 KOLOM: SIDEBAR FILTER & LIST KAMAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start pt-2">
          {/* SIDEBAR FILTER KIRI */}
          <aside className="lg:col-span-3 bg-white border border-stone-200/90 rounded-md p-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F2334]">Filter</span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-[#9A7840] hover:underline cursor-pointer"
              >
                Atur ulang
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-600">
                Kategori kamar
              </p>
              {[
                { id: "ALL", label: "Semua tipe" },
                { id: "SUPERIOR", label: "Superior" },
                { id: "DELUXE", label: "Deluxe" },
                { id: "SUITE", label: "Suite" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === item.id}
                    onChange={() => setSelectedCategory(item.id)}
                    className="accent-[#0F2334]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <hr className="border-stone-100" />

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-600">
                Pilihan tempat tidur
              </p>
              {[
                { id: "ALL", label: "Semua pilihan" },
                { id: "King", label: "1 ranjang King" },
                { id: "Twin", label: "2 ranjang Twin" },
              ].map((bed) => (
                <label
                  key={bed.id}
                  className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="bedType"
                    checked={selectedBed === bed.id}
                    onChange={() => setSelectedBed(bed.id)}
                    className="accent-[#0F2334]"
                  />
                  <span>{bed.label}</span>
                </label>
              ))}
            </div>

            <hr className="border-stone-100" />

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-600">
                Harga maksimal per malam
              </p>
              <input
                type="range"
                min={600000}
                max={1250000}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0F2334]"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>Rp600rb</span>
                <span className="font-semibold text-[#0F2334]">
                  Rp{maxPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="bg-[#FAF7F2] border border-stone-200/70 rounded p-3 text-[11px] text-stone-600 space-y-1">
              <p className="font-semibold text-[#0F2334]">
                Jaminan harga terbaik
              </p>
              <p className="text-[10px] leading-relaxed text-stone-500">
                Pemesanan langsung melalui situs Nestra selalu mendapatkan harga
                terendah tanpa biaya layanan tambahan.
              </p>
            </div>
          </aside>

          {/* DAFTAR KAMAR KANAN */}
          <section className="lg:col-span-9 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <p className="text-stone-500">
                Menampilkan{" "}
                <strong className="text-[#0F2334]">{rooms.length} tipe kamar</strong>{" "}
                tersedia
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-stone-200 rounded px-2.5 py-1.5 text-xs bg-white text-[#0F2334]"
                >
                  <option value="recommended">Rekomendasi</option>
                  <option value="price_asc">Harga terendah</option>
                  <option value="price_desc">Harga tertinggi</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="bg-white border border-stone-200 rounded-md p-10 text-center text-xs text-stone-500">
                Memuat daftar kamar...
              </div>
            ) : rooms.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-md p-10 text-center space-y-3">
                <p className="font-serif text-xl text-[#0F2334]">
                  Tidak ada kamar yang sesuai filter
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-[#0F2334] text-white text-xs px-4 py-2 rounded"
                >
                  Reset semua filter
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {rooms.map((room) => {
                  const isFull = Boolean(room.isFull);
                  const fallbackImg =
                    ROOM_IMAGES_BY_CATEGORY[room.category?.toUpperCase()] ||
                    ROOM_IMAGES_BY_CATEGORY.DEFAULT;
                  const imageSrc =
                    room.imageUrl && room.imageUrl.trim() !== ""
                      ? room.imageUrl
                      : fallbackImg;

                  return (
                    <article
                      key={room.id}
                      className={`bg-white border rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-12 transition ${
                        isFull
                          ? "border-stone-300 opacity-90"
                          : "border-stone-200/90 hover:border-stone-300"
                      }`}
                    >
                      {/* KOLOM FOTO */}
                      <div className="md:col-span-5 relative aspect-[16/11] md:aspect-auto md:min-h-[250px] bg-stone-200 overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={room.name}
                          onError={(e) => {
                            if (e.currentTarget.src !== fallbackImg) {
                              e.currentTarget.src = fallbackImg;
                            }
                          }}
                          className={`w-full h-full object-cover transition duration-300 ${
                            isFull ? "grayscale opacity-65" : ""
                          }`}
                        />

                        {isFull && (
                          <div className="absolute inset-0 bg-[#0F2334]/70 flex items-center justify-center p-4">
                            <div className="border border-white/80 bg-red-600/95 text-white px-4 py-1.5 rounded text-center">
                              <span className="block text-xs font-bold tracking-[0.2em] uppercase">
                                SEDANG PENUH
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* KOLOM DETAIL */}
                      <div className="md:col-span-7 p-6 flex flex-col justify-between gap-4">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2 text-[10px]">
                            <span className="uppercase tracking-widest font-bold text-[#9A7840]">
                              {room.category}
                            </span>

                            {isFull ? (
                              <span className="bg-red-50 text-red-700 border border-red-200 font-semibold px-2 py-0.5 rounded">
                                Tidak tersedia / Penuh
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded">
                                Tersisa {room.remainingRooms ?? 3} kamar
                              </span>
                            )}
                          </div>

                          <h2 className="font-serif text-2xl text-[#0F2334]">
                            {room.name}
                          </h2>

                          <p className="text-[11px] text-stone-500">
                            {room.sizeSqm} m² • Maks. {room.maxGuests} tamu •{" "}
                            {room.bedType} • {room.viewType}
                          </p>

                          <p className="text-xs text-stone-600 leading-relaxed">
                            {room.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {room.amenities?.slice(0, 4).map((amenity, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-[#FAF7F2] border border-stone-200/80 text-stone-600 px-2.5 py-0.5 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <span className="block text-[10px] text-stone-400">
                              Mulai dari
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-[#0F2334]">
                                Rp{room.basePrice.toLocaleString("id-ID")}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                / malam
                              </span>
                            </div>
                            <span className="block text-[10px] text-stone-400">
                              Termasuk sarapan &amp; pajak
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <Link
                              href={`/kamar/${room.slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                              className="border border-stone-300 hover:border-[#0F2334] text-[#0F2334] text-xs font-medium px-3.5 py-2 rounded transition"
                            >
                              Lihat detail
                            </Link>

                            {isFull ? (
                              <button
                                type="button"
                                disabled
                                className="bg-stone-300 text-stone-600 text-xs font-semibold px-4 py-2 rounded cursor-not-allowed"
                              >
                                Sedang penuh
                              </button>
                            ) : (
                              <Link
                                href={`/reservasi/checkout?room=${room.slug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                                className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-4 py-2 rounded transition"
                              >
                                Pilih kamar →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
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

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs text-stone-500">
          Memuat halaman kamar...
        </div>
      }
    >
      <RoomsCatalogContent />
    </Suspense>
  );
}