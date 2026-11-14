"use client";

import React, { useState } from "react";
import Link from "next/link";

type OfferCategory = "all" | "long-stay" | "early-bird" | "weekend";

interface OfferItem {
  id: string;
  category: Exclude<OfferCategory, "all">;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  promoCode: string;
  validUntil: string;
  priceStart: string;
  image: string;
  roomSlug: string;
}

const OFFERS_DATA: OfferItem[] = [
  {
    id: "long-stay-3-nights",
    category: "long-stay",
    badge: "HEMAT HINGGA 20%",
    title: "Menginap Lebih Lama di Yogyakarta",
    subtitle: "Minimal menginap 3 malam • Semua tipe kamar",
    description:
      "Nikmati ritme kota Yogyakarta tanpa terburu-buru. Pesan minimal tiga malam berturut-turut dan dapatkan potongan harga khusus serta waktu check-out lebih santai.",
    benefits: [
      "Diskon 20% dari tarif fleksibel harian",
      "Sarapan pagi untuk 2 orang di Restoran Serambi",
      "Late check-out hingga pukul 14.00 WIB (sesuai ketersediaan)",
    ],
    promoCode: "NESTRALAMA",
    validUntil: "Berlaku hingga 20 Desember 2026",
    priceStart: "Mulai Rp680.000 / malam",
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80",
    roomSlug: "deluks",
  },
  {
    id: "early-bird-escape",
    category: "early-bird",
    badge: "PESAN LEBIH AWAL",
    title: "Rencana Matang, Harga Lebih Tenang",
    subtitle: "Pemesanan minimal 14 hari sebelum kedatangan",
    description:
      "Susun agenda liburan atau perjalanan kerja Anda jauh hari sebelumnya dan amankan tarif terbaik langsung melalui situs resmi Nestra Hotel.",
    benefits: [
      "Potongan langsung 15% untuk pemesanan H-14",
      "Minuman selamat datang khas wedang rempah saat tiba",
      "Gratis perubahan tanggal 1 kali (maksimal H-5)",
    ],
    promoCode: "AWAL15",
    validUntil: "Berlaku untuk menginap kapan saja",
    priceStart: "Mulai Rp637.500 / malam",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
    roomSlug: "superior",
  },
  {
    id: "weekend-serambi",
    category: "weekend",
    badge: "PAKET AKHIR PEKAN",
    title: "Jeda Akhir Pekan & Kudapan Sore",
    subtitle: "Check-in Jumat atau Sabtu • Kamar Deluks & Suite",
    description:
      "Lepaskan penat sejenak di akhir pekan. Nikmati suasana tenang di tepi kolam alami lengkap dengan sajian teh dan kudapan tradisional sore hari.",
    benefits: [
      "Sajian teh sore & jajanan pasar untuk 2 orang di Serambi",
      "Sarapan pagi untuk 2 orang",
      "Akses penuh kolam renang & area santai tropis",
    ],
    promoCode: "JOGJAJEDA",
    validUntil: "Berlaku setiap Jumat – Minggu",
    priceStart: "Mulai Rp890.000 / malam",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
    roomSlug: "deluks",
  },
  {
    id: "family-suite-getaway",
    category: "weekend",
    badge: "KHUSUS KELUARGA",
    title: "Momen Hangat Bersama Keluarga",
    subtitle: "Kamar Family Suite • Termasuk sarapan 4 orang",
    description:
      "Ruang lebih lega untuk berbagi cerita bersama orang terdekat, hanya beberapa menit dari kawasan Tugu dan Malioboro.",
    benefits: [
      "Sarapan pagi untuk 2 dewasa & 2 anak",
      "Gratis 1 extra bed atau perlengkapan anak",
      "Voucher makan Rp150.000 di Restoran Serambi",
    ],
    promoCode: "KELUARGA26",
    validUntil: "Berlaku hingga 30 November 2026",
    priceStart: "Mulai Rp1.350.000 / malam",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80",
    roomSlug: "family-suite",
  },
];

export default function OffersPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<OfferCategory>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredOffers = OFFERS_DATA.filter((offer) => {
    if (selectedCategory === "all") return true;
    return offer.category === selectedCategory;
  });

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-[#1A202C]">
      {/* 1. NAVBAR */}
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
            <Link href="/kamar" className="hover:text-[#0F2334] transition">
              Kamar
            </Link>
            <Link href="/fasilitas" className="hover:text-[#0F2334] transition">
              Fasilitas & pengalaman
            </Link>
            <Link href="/penawaran" className="text-[#0F2334] font-semibold">
              Penawaran
            </Link>
            <Link href="/kontak" className="hover:text-[#0F2334] transition">
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
              className="bg-[#0F2334] hover:bg-[#19354d] text-white px-5 py-2.5 rounded text-xs font-medium transition"
            >
              Pesan kamar
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-8 pb-12">
        <nav className="text-[11px] text-stone-400 flex items-center gap-1.5 mb-6">
          <Link href="/" className="hover:text-stone-600">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-stone-600">Penawaran</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
              PENAWARAN EKSKLUSIF LANGSUNG
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-[#0F2334] leading-tight">
              Lebih banyak alasan untuk tinggal sedikit lebih lama.
            </h1>
            <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
              Dapatkan tarif terbaik, fleksibilitas perubahan jadwal, dan
              keuntungan tambahan khusus untuk pemesanan langsung di situs
              resmi Nestra Hotel.
            </p>
            <div className="pt-1">
              <span className="inline-block bg-[#EFE9DD] text-amber-900 text-[11px] font-medium px-3 py-1 rounded">
                Jaminan harga terbaik pemesanan langsung
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 h-64 md:h-80 rounded-md overflow-hidden bg-stone-200 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
              alt="Suasana Santai Nestra Hotel Yogyakarta"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. CATEGORY FILTER TABS */}
      <section className="max-w-6xl w-full mx-auto px-6 pb-8">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-stone-200 pb-5">
          {[
            { key: "all", label: "Semua penawaran" },
            { key: "long-stay", label: "Menginap lebih lama" },
            { key: "early-bird", label: "Pesan lebih awal" },
            { key: "weekend", label: "Paket akhir pekan & keluarga" },
          ].map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key as OfferCategory)}
                className={`px-4 py-2 rounded text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-[#0F2334] text-white"
                    : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. OFFERS GRID */}
      <section className="max-w-6xl w-full mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredOffers.map((offer) => (
            <article
              key={offer.id}
              className="bg-white rounded-md border border-stone-200/90 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative h-56 bg-stone-200 overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3.5 left-3.5 bg-[#0F2334] text-white text-[10px] tracking-wider font-semibold px-3 py-1 rounded-xs">
                    {offer.badge}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-[11px] font-medium text-amber-800">
                      {offer.subtitle}
                    </p>
                    <h2 className="font-serif text-2xl text-[#0F2334] mt-1">
                      {offer.title}
                    </h2>
                    <p className="text-xs text-stone-500 leading-relaxed mt-2">
                      {offer.description}
                    </p>
                  </div>

                  {/* Included Benefits */}
                  <div className="pt-3 border-t border-stone-100 space-y-2">
                    <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      TERMASUK DALAM PENAWARAN
                    </span>
                    <ul className="space-y-1.5 text-xs text-stone-600">
                      {offer.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer: Promo Code & CTA */}
              <div className="px-6 pb-6 pt-3 space-y-4">
                <div className="bg-[#F8F6F2] border border-dashed border-stone-300 rounded px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-stone-400">
                      KODE PROMO
                    </span>
                    <span className="text-xs font-bold tracking-widest text-[#0F2334]">
                      {offer.promoCode}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.promoCode)}
                    className="text-[11px] font-semibold text-[#0F2334] bg-white border border-stone-200 hover:bg-stone-50 px-3 py-1.5 rounded transition cursor-pointer"
                  >
                    {copiedCode === offer.promoCode
                      ? "Tersalin ✓"
                      : "Salin kode"}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div>
                    <span className="block text-xs font-bold text-[#0F2334]">
                      {offer.priceStart}
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      {offer.validUntil}
                    </span>
                  </div>

                  <Link
                    href={`/kamar/${offer.roomSlug}`}
                    className="bg-[#0F2334] hover:bg-[#19354d] text-white px-4 py-2.5 rounded text-xs font-medium transition shrink-0"
                  >
                    Gunakan penawaran →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. DIRECT BOOKING PERKS SECTION */}
      <section className="bg-white border-t border-b border-stone-200/80 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
              KEUNTUNGAN PEMESANAN LANGSUNG
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#0F2334] mt-1">
              Selalu lebih nyaman saat memesan langsung di sini.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-amber-800 text-base">🏷️</div>
              <h3 className="text-xs font-bold text-[#0F2334]">
                Tanpa biaya perantara tersembunyi
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Harga transparan sejak awal pemilihan kamar hingga rincian
                pembayaran akhir.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-amber-800 text-base">🗓️</div>
              <h3 className="text-xs font-bold text-[#0F2334]">
                Perubahan jadwal lebih mudah
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Ubah tanggal menginap langsung melalui halaman Reservasi saya
                atau hubungi tim resepsionis kami 24 jam.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-amber-800 text-base">✨</div>
              <h3 className="text-xs font-bold text-[#0F2334]">
                Prioritas permintaan khusus
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Pilihan lantai atas, kamar berdekatan, atau kedatangan lebih
                awal diprioritaskan untuk tamu langsung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section className="bg-[#EFE9DD] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl md:text-2xl text-[#0F2334]">
              Sudah menentukan tanggal perjalanan Anda?
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Masukkan kode promo pada langkah pembayaran untuk mendapatkan
              potongan langsung.
            </p>
          </div>
          <Link
            href="/kamar"
            className="bg-[#0F2334] hover:bg-[#19354d] text-white px-5 py-2.5 rounded text-xs font-medium transition inline-flex items-center gap-2 shrink-0"
          >
            <span>Lihat ketersediaan kamar</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* 7. FULL FOOTER */}
      <footer className="bg-[#0F2334] text-stone-300 pt-14 pb-8 text-xs mt-auto">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          <div className="space-y-3">
            <div className="font-bold tracking-wider text-white text-sm">
              NESTRA HOTEL
            </div>
            <p className="text-[11px] text-amber-200/80">
              Your Stay, Made Simple.
            </p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Ruang nyaman, keramahan tulus, dan Yogyakarta yang selalu dekat.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-white font-semibold mb-2">Temukan kami</div>
            <p className="text-stone-400">
              Jl. Mangkubumi No. 28, Gowongan, Jetis, Yogyakarta 55232
            </p>
            <p className="text-stone-400 pt-1">+62 274 582 100</p>
            <p className="text-stone-400">halo@nestrahotel.id</p>
          </div>

          <div className="space-y-1.5">
            <div className="text-white font-semibold mb-2">Jelajahi Nestra</div>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <Link href="/kamar" className="hover:text-white">
                  Kamar & harga
                </Link>
              </li>
              <li>
                <Link href="/fasilitas" className="hover:text-white">
                  Fasilitas & pengalaman
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

          <div className="space-y-1.5">
            <div className="text-white font-semibold mb-2">Bantuan tamu</div>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <Link href="/reservasi-saya" className="hover:text-white">
                  Reservasi saya
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  Pertanyaan umum
                </Link>
              </li>
              <li>
                <Link href="/kebijakan" className="hover:text-white">
                  Kebijakan pembatalan
                </Link>
              </li>
              <li>
                <Link href="/syarat" className="hover:text-white">
                  Syarat & ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-stone-400 gap-4">
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