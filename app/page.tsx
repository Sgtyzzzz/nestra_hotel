"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const HOME_ROOMS = [
  {
    slug: "kamar-superior",
    name: "Superior",
    specs: "28 m² • 2 Tamu • Twin / Double",
    price: "Rp850.000",
    image:
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1000&q=80",
  },
  {
    slug: "kamar-deluks",
    name: "Deluks",
    specs: "36 m² • 2 Tamu • King",
    price: "Rp1.150.000",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
  },
  {
    slug: "kamar-keluarga",
    name: "Kamar Keluarga",
    specs: "48 m² • 4 Tamu • 2 Queen",
    price: "Rp1.650.000",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80",
  },
];

const FAQS = [
  {
    q: "Kapan waktu masuk dan keluar?",
    a: "Waktu masuk (check-in) dimulai pukul 14.00 WIB, dan waktu keluar (check-out) paling lambat pukul 12.00 WIB.",
  },
  {
    q: "Apakah harga sudah termasuk sarapan?",
    a: "Ya, seluruh pemesanan langsung di situs resmi Nestra Hotel sudah termasuk sarapan pagi hangat di Restoran Serambi.",
  },
  {
    q: "Bagaimana kebijakan pembatalannya?",
    a: "Pembatalan gratis dapat dilakukan hingga 24 jam sebelum jadwal kedatangan melalui halaman Reservasi Saya.",
  },
  {
    q: "Apakah tersedia parkir dan akses untuk keluarga?",
    a: "Tersedia area parkir pribadi gratis di dalam lingkungan hotel serta akses ramah kursi roda dan keluarga.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("2026-10-16");
  const [checkOut, setCheckOut] = useState("2026-10-18");
  const [guests, setGuests] = useState("2 Dewasa • 1 Kamar");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== FALLBACK_IMG) {
      e.currentTarget.src = FALLBACK_IMG;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/kamar?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div className="min-h-screen bg-white text-[#0F2334] font-sans">
      {/* 1. NAVBAR ATAS PUTIH SESUAI FIGMA */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs">
          {/* Logo Kiri */}
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

          {/* Menu Tengah */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-stone-700">
            <Link href="/" className="font-bold text-[#0F2334]">
              Beranda
            </Link>
            <Link href="/kamar" className="hover:text-[#0F2334] transition">
              Kamar
            </Link>
            <Link href="/fasilitas" className="hover:text-[#0F2334] transition">
              Fasilitas &amp; Pengalaman
            </Link>
            <Link href="/penawaran" className="hover:text-[#0F2334] transition">
              Penawaran
            </Link>
            <Link href="/kontak" className="hover:text-[#0F2334] transition">
              Hubungi Kami
            </Link>
          </nav>

          {/* Aksi Kanan */}
          <div className="flex items-center gap-4">
            <Link
              href="/reservasi-saya"
              className="hidden sm:inline text-xs font-medium text-stone-700 hover:text-[#0F2334]"
            >
              Reservasi Saya
            </Link>
            <Link
              href="/kamar"
              className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-4 py-2 rounded transition"
            >
              Pesan Kamar
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER + FLOATING SEARCH BAR */}
      <section className="relative bg-[#0F2334] text-white">
        <div className="relative min-h-[540px] flex items-center">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80"
            alt="Lobby Nestra Hotel Yogyakarta"
            onError={handleImgError}
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2334]/90 via-[#0F2334]/65 to-[#0F2334]/35" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
            <div className="max-w-xl space-y-4">
              <span className="block text-[10px] uppercase tracking-[0.24em] text-[#E5C687] font-semibold">
                NESTRA HOTEL • YOGYAKARTA
              </span>
              <h1 className="font-serif text-4xl md:text-6xl leading-[1.12] text-white">
                Singgah dengan tenang. Jelajahi dengan leluasa.
              </h1>
              <p className="font-serif italic text-lg text-[#E5C687]">
                Your Stay, Made Simple.
              </p>
              <p className="text-xs md:text-sm text-stone-100 leading-relaxed max-w-md">
                Kenyamanan modern dengan sentuhan hangat Yogyakarta, tertata
                untuk perjalanan yang bernilai.
              </p>

              <div className="flex flex-wrap items-center gap-5 pt-3 text-xs">
                <Link
                  href="/kamar"
                  className="text-white font-semibold underline underline-offset-4 hover:text-[#E5C687]"
                >
                  • Jelajahi Kamar
                </Link>
                <Link
                  href="/penawaran"
                  className="text-stone-200 hover:text-white transition"
                >
                  Lihat Penawaran Musim Ini
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Mengambang di Bawah Hero */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 -mt-10 pb-6">
          <form
            onSubmit={handleSearch}
            className="bg-white text-[#0F2334] rounded-md shadow-lg border border-stone-200 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            <div className="lg:col-span-3">
              <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                Kota
              </label>
              <input
                type="text"
                readOnly
                value="Nestra Hotel Yogyakarta"
                className="w-full border border-stone-200 bg-stone-50 rounded px-3 py-2 text-xs font-medium text-[#0F2334]"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                Tanggal Masuk
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs font-medium text-[#0F2334] bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                Tanggal Keluar
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs font-medium text-[#0F2334] bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                Tamu &amp; Kamar
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs font-medium text-[#0F2334] bg-white"
              >
                <option>2 Dewasa • 1 Kamar</option>
                <option>1 Dewasa • 1 Kamar</option>
                <option>4 Dewasa • 2 Kamar</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold py-2.5 px-4 rounded transition cursor-pointer"
              >
                Cari Kamar →
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. HAL-HAL SEDERHANA, YANG MEMBUAT BETAH */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <h2 className="font-serif text-3xl text-[#0F2334] leading-snug">
              Hal-hal sederhana, yang membuat betah.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
              Detail kecil yang sering luput justru menjadi bagian paling
              mengesankan dari menginap. Kami merancang Nestra untuk terasa
              hangat, teratur, dan tidak rumit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div className="space-y-2">
            <span className="text-sm text-[#9A7840]">📍</span>
            <h3 className="text-xs font-bold text-[#0F2334]">
              Di jantung Yogyakarta
            </h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Dekat pusat budaya, kuliner lokal, dan stasiun utama kota.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-[#9A7840]">🛏</span>
            <h3 className="text-xs font-bold text-[#0F2334]">
              Nyaman tanpa berlebihan
            </h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Kamar tenang, tempat tidur berkualitas, dan tata ruang fungsional.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-[#9A7840]">☕</span>
            <h3 className="text-xs font-bold text-[#0F2334]">
              Pagi yang lebih baik
            </h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Sarapan lokal segar disajikan hangat setiap pagi.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-[#9A7840]">🤍</span>
            <h3 className="text-xs font-bold text-[#0F2334]">
              Melayani sepenuh hati
            </h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Kecepatan respons resepsionis dan keramahtamahan tulus.
            </p>
          </div>
        </div>
      </section>

      {/* 4. KAMAR YANG PAS UNTUK ANDA (LATAR KREM HANGAT #F6F1E9) */}
      <section className="bg-[#F6F1E9] py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A7840] font-bold">
                AKOMODASI KAMI
              </span>
              <h2 className="font-serif text-3xl text-[#0F2334]">
                Kamar yang pas untuk Anda.
              </h2>
              <p className="text-xs text-stone-600">
                Untuk sendiri, bersama pasangan, atau perjalanan bersama
                keluarga kecil.
              </p>
            </div>
            <Link
              href="/kamar"
              className="bg-white border border-stone-300 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-4 py-2 rounded transition self-start sm:self-auto"
            >
              Lihat semua kamar →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOME_ROOMS.map((room) => (
              <div
                key={room.slug}
                className="bg-white rounded-md overflow-hidden border border-stone-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] bg-stone-200 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      onError={handleImgError}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-1.5">
                    <h3 className="font-serif text-xl text-[#0F2334]">
                      {room.name}
                    </h3>
                    <p className="text-[11px] text-stone-500">{room.specs}</p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-end justify-between">
                  <div>
                    <span className="block text-[10px] text-stone-400">
                      Mulai dari
                    </span>
                    <span className="text-sm font-bold text-[#0F2334]">
                      {room.price}
                      <span className="text-[11px] font-normal text-stone-500">
                        {" "}
                        / malam
                      </span>
                    </span>
                  </div>
                  <Link
                    href={`/kamar/${room.slug}`}
                    className="text-xs font-semibold text-[#0F2334] hover:text-[#9A7840]"
                  >
                    Lihat kamar →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-stone-500">
            * Harga sudah termasuk pajak &amp; layanan • Sarapan tersedia
            berdasarkan pilihan paket.
          </p>
        </div>
      </section>

      {/* 5. LUANGKAN WAKTU. NIKMATI RITMENYA. */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6">
          <div className="aspect-[4/3] rounded-md overflow-hidden bg-stone-200 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1100&q=80"
              alt="Kolam Renang Taman Nestra"
              onError={handleImgError}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A7840] font-bold">
            FASILITAS &amp; SUASANA
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#0F2334] leading-snug">
            Luangkan waktu. Nikmati ritmenya.
          </h2>
          <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
            Berenang di antara agenda, sarapan santai tanpa tergesa, atau
            menyesap kopi sore di sudut yang tenang.
          </p>
          <p className="text-xs font-medium text-[#0F2334]">
            Kolam Renang Taman • Restoran &amp; Sarapan Hangat • Lounge Tenang
          </p>
          <div className="pt-2">
            <Link
              href="/fasilitas"
              className="inline-block border border-stone-300 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-4 py-2.5 rounded transition"
            >
              Jelajahi Fasilitas →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. ADA ALASAN UNTUK TINGGAL LEBIH LAMA (PROMO CARDS) */}
      <section className="bg-[#F6F1E9] py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A7840] font-bold">
              PENAWARAN SPESIAL
            </span>
            <h2 className="font-serif text-3xl text-[#0F2334]">
              Ada alasan untuk tinggal lebih lama.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Foto Sarapan Kiri */}
            <div className="lg:col-span-4 rounded-md overflow-hidden bg-stone-200 min-h-[240px]">
              <img
                src="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80"
                alt="Sarapan Santai Nestra Hotel"
                onError={handleImgError}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Kartu Gelap Tengah (Tulisan Putih & Emas Jelas!) */}
            <div className="lg:col-span-5 bg-[#0F2334] text-white rounded-md p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-2.5">
                <span className="inline-block bg-[#C6A267] text-[#0F2334] text-[10px] font-bold px-2.5 py-0.5 rounded">
                  Hemat 15%
                </span>
                <h3 className="font-serif text-2xl text-white">
                  Akhir pekan, tanpa terburu-buru.
                </h3>
                <p className="text-xs text-stone-200 leading-relaxed">
                  Menginap 2 malam atau lebih dan nikmati sarapan pagi untuk
                  berdua serta waktu check-out yang lebih panjang.
                </p>
                <p className="text-sm font-bold text-[#E5C687] pt-1">
                  Deluks • Rp950.000 / malam
                </p>
              </div>

              <div>
                <Link
                  href="/penawaran"
                  className="inline-block bg-white hover:bg-stone-100 text-[#0F2334] text-xs font-bold px-4 py-2 rounded transition"
                >
                  Pilih paket menginap
                </Link>
              </div>
            </div>

            {/* Kartu Krem Kanan */}
            <div className="lg:col-span-3 bg-[#EAE2D3] text-[#0F2334] rounded-md p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-2.5">
                <h3 className="font-serif text-xl text-[#0F2334]">
                  Pesan langsung, lebih tenang.
                </h3>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Harga terbaik, tanpa perantara, dan prioritas permintaan
                  kamar.
                </p>
              </div>
              <div>
                <Link
                  href="/penawaran"
                  className="text-xs font-bold text-[#0F2334] hover:underline"
                >
                  Gunakan kode: NESTRA15 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONI TAMU (4,8 / 5) */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A7840] font-bold">
              ULASAN TAMU
            </span>
            <h2 className="font-serif text-3xl text-[#0F2334]">
              Datang sebagai tamu. Pulang dengan cerita.
            </h2>
          </div>

          <div className="sm:text-right">
            <p className="font-serif text-3xl text-[#0F2334]">
              4,8 <span className="text-base text-stone-400">/ 5</span>
            </p>
            <p className="text-[11px] text-[#C6A267]">★★★★★</p>
            <p className="text-[10px] text-stone-500">
              Berdasarkan 320+ ulasan tamu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          <div className="space-y-3">
            <p className="text-xs text-[#C6A267]">★★★★★</p>
            <p className="text-xs text-stone-700 leading-relaxed">
              &ldquo;Tempat terbaik untuk singgah di Jogja. Kamar bersih,
              suasana tenang, dan stafnya sangat ramah menyambut sejak pertama
              tiba.&rdquo;
            </p>
            <div>
              <p className="text-xs font-bold text-[#0F2334]">Rani Anggraini</p>
              <p className="text-[10px] text-stone-500">
                Jakarta • Menginap 2 malam
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#C6A267]">★★★★★</p>
            <p className="text-xs text-stone-700 leading-relaxed">
              &ldquo;Lokasinya strategis dekat Stasiun Tugu, tapi di dalam hotel
              sangat teduh dan nyaman untuk istirahat bersama keluarga.&rdquo;
            </p>
            <div>
              <p className="text-xs font-bold text-[#0F2334]">Bima Santoso</p>
              <p className="text-[10px] text-stone-500">
                Bandung • Kamar Keluarga
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#C6A267]">★★★★★</p>
            <p className="text-xs text-stone-700 leading-relaxed">
              &ldquo;Proses check-in cepat tanpa ribet. Sarapannya enak dan
              area kolam renangnya bikin betah berlama-lama di hotel.&rdquo;
            </p>
            <div>
              <p className="text-xs font-bold text-[#0F2334]">Nadia Putri</p>
              <p className="text-[10px] text-stone-500">
                Surabaya • Kamar Deluks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. LOKASI (DI TENGAH KOTA. DEKAT DENGAN CERITANYA.) */}
      <section className="bg-[#F6F1E9] py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A7840] font-bold">
              LOKASI STRATEGIS
            </span>
            <h2 className="font-serif text-3xl text-[#0F2334] leading-snug">
              Di tengah kota. Dekat dengan ceritanya.
            </h2>
            <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
              Terletak di kawasan Mangkubumi, dekat Stasiun Tugu dan Malioboro,
              namun tetap menjaga ketenangan untuk beristirahat.
            </p>
            <p className="text-xs font-semibold text-[#0F2334]">
              Jl. Mangkubumi No. 28, Gowongan, Jetis, Yogyakarta 55232
            </p>
            <p className="text-[11px] text-stone-600">
              • 5 menit dari Stasiun Tugu • 10 menit jalan kaki ke Malioboro • 15
              menit ke Keraton Yogyakarta
            </p>
            <div className="pt-2">
              <Link
                href="/kontak"
                className="inline-block bg-white border border-stone-300 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-4 py-2 rounded transition"
              >
                Lihat Rute &amp; Kontak →
              </Link>
            </div>
          </div>

          {/* Peta Visual Yogyakarta */}
          <div className="lg:col-span-6">
            <div className="bg-[#E5E2DC] rounded-md border border-stone-300/80 h-64 relative overflow-hidden p-6 flex items-center justify-center">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-3 opacity-70">
                <div className="bg-[#EFECE6] rounded-sm p-2 text-[10px] text-stone-500">
                  Tugu Yogyakarta
                </div>
                <div className="bg-[#EFECE6] rounded-sm" />
                <div className="bg-[#EFECE6] rounded-sm p-2 text-[10px] text-stone-500 text-right">
                  Jl. Mangkubumi
                </div>
                <div className="bg-[#EFECE6] rounded-sm" />
                <div className="bg-[#D5E2D0] rounded-sm" />
                <div className="bg-[#EFECE6] rounded-sm" />
                <div className="bg-[#EFECE6] rounded-sm p-2 text-[10px] text-stone-500 flex items-end">
                  Stasiun Tugu
                </div>
                <div className="bg-[#EFECE6] rounded-sm" />
                <div className="bg-[#EFECE6] rounded-sm p-2 text-[10px] text-stone-500 flex items-end justify-end">
                  Kawasan Malioboro
                </div>
              </div>

              <div className="relative z-10 bg-[#0F2334] text-white px-4 py-2 rounded shadow-md text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C6A267]" />
                <span>Nestra Hotel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. YANG INGIN ANDA KETAHUI (FAQ) */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A7840] font-bold">
            PERTANYAAN UMUM
          </span>
          <h2 className="font-serif text-3xl text-[#0F2334]">
            Yang ingin Anda ketahui.
          </h2>
          <p className="text-xs text-stone-600">
            Masih punya pertanyaan lain? Tim resepsionis kami siap membantu.
          </p>
          <Link
            href="/kontak"
            className="inline-block text-xs font-bold text-[#0F2334] hover:underline pt-1"
          >
            Hubungi Kami →
          </Link>
        </div>

        <div className="lg:col-span-8 divide-y divide-stone-200 border-y border-stone-200">
          {FAQS.map((item, idx) => (
            <div key={item.q} className="py-4">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-[#0F2334] cursor-pointer"
              >
                <span>{item.q}</span>
                <span className="text-stone-400">
                  {openFaq === idx ? "⌃" : "⌄"}
                </span>
              </button>
              {openFaq === idx && (
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. CTA BANNER BAWAH */}
      <section className="bg-[#EAE2D3] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-[#0F2334]">
              Perjalanan berikutnya dimulai di sini.
            </h2>
            <p className="text-xs text-stone-700">
              Pilih kamar yang sesuai untuk tanggal kunjungan Anda.
            </p>
          </div>
          <Link
            href="/kamar"
            className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-5 py-3 rounded transition self-start sm:self-auto"
          >
            Temukan Kamar Anda →
          </Link>
        </div>
      </section>

      {/* 11. FOOTER GELAP #0F2334 SESUAI FIGMA */}
      <footer className="bg-[#0F2334] text-white pt-16 pb-10 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
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
                Pengalaman menginap butik yang hangat, tenang, dan berkarakter di
                pusat Kota Yogyakarta.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2">
              <p className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Kontak Kami
              </p>
              <p className="text-[11px] text-stone-300">
                Jl. Mangkubumi No. 28, Gowongan, Jetis, Yogyakarta 55232
              </p>
              <p className="text-[11px] text-stone-300">+62 274 555 0198</p>
              <p className="text-[11px] text-stone-300">halo@nestrahotel.id</p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <p className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Jelajahi Hotel
              </p>
              <ul className="space-y-1.5 text-[11px] text-stone-300">
                <li>
                  <Link href="/kamar" className="hover:text-white">
                    Kamar &amp; Suite
                  </Link>
                </li>
                <li>
                  <Link href="/fasilitas" className="hover:text-white">
                    Fasilitas &amp; Pengalaman
                  </Link>
                </li>
                <li>
                  <Link href="/penawaran" className="hover:text-white">
                    Penawaran Spesial
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white">
                    Hubungi Kami
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-2">
              <p className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Bantuan Tamu
              </p>
              <ul className="space-y-1.5 text-[11px] text-stone-300">
                <li>
                  <Link href="/reservasi-saya" className="hover:text-white">
                    Reservasi Saya
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white">
                    Pertanyaan Umum
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-white">
                    Kebijakan Pembatalan
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-white">
                    Portal Pengelola
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-stone-400">
            <span>© 2026 Nestra Hotel. Seluruh hak cipta dilindungi.</span>
            <span>Yogyakarta • Indonesia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}