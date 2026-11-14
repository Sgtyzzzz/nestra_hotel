"use client";

import React from "react";
import Link from "next/link";

const FACILITY_CARDS = [
  {
    id: "pool",
    category: "KOLAM RENANG ALAM",
    title: "Jeda yang menyegarkan.",
    description:
      "Kolam terbuka yang tenang di antara hijau tropis. Berenang ringan, menemani anak bermain, atau membaca di kursi santai — nikmati tanpa terburu-buru.",
    schedule: "06.00–21.00 WIB • Kolam anak tersedia • Handuk gratis",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Kolam Renang Alam Nestra Hotel",
    imagePosition: "left",
    ctaText: null,
    ctaHref: null,
  },
  {
    id: "restaurant",
    category: "RESTORAN SERAMBI",
    title: "Pagi dimulai dari Serambi.",
    description:
      "Sarapan lokal, buah segar, dan kopi pilihan disajikan setiap pagi. Untuk makan siang dan malam, temukan menu Indonesia yang akrab di meja Anda.",
    schedule: "Sarapan 06.30–10.00 WIB • Restoran 06.30–22.00 WIB",
    image:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Sarapan di Restoran Serambi",
    imagePosition: "right",
    ctaText: null,
    ctaHref: null,
  },
  {
    id: "meeting-room",
    category: "RUANG PERTEMUAN",
    title: "Ide baik butuh ruang yang tepat.",
    description:
      "Ruang fleksibel untuk rapat tim, lokakarya kecil, dan pertemuan bisnis. Perangkat presentasi, internet stabil, dan tim pendukung tersedia agar agenda berjalan lancar.",
    schedule: "Hingga 30 orang • Proyektor • Paket mulai Rp250.000/orang",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Ruang Pertemuan Nestra Hotel",
    imagePosition: "left",
    ctaText: "Tanyakan paket pertemuan",
    ctaHref: "/kontak?topik=pertemuan",
  },
];

const CONVENIENCE_ITEMS = [
  {
    icon: "📶",
    title: "Internet cepat",
    desc: "Gratis di kamar dan area bersama.",
  },
  {
    icon: "🅿️",
    title: "Parkir tamu",
    desc: "Aman, gratis, dan akses mudah 24 jam.",
  },
  {
    icon: "🛎️",
    title: "Resepsionis 24 jam",
    desc: "Bantuan kapan pun dibutuhkan.",
  },
  {
    icon: "♿",
    title: "Akses yang nyaman",
    desc: "Lift, akses landai, dan bantuan staf.",
  },
];

const LOCAL_DESTINATIONS = [
  {
    number: "01",
    title: "Tugu & Malioboro",
    distance: "10–15 menit berjalan",
    desc: "Menyusuri koridor ikonik, toko kerajinan lokal, dan jajanan khas Malioboro.",
  },
  {
    number: "02",
    title: "Keraton & Taman Sari",
    distance: "15 menit berkendara",
    desc: "Menyelami warisan budaya Yogyakarta. Sebaiknya berkunjung sebelum tengah hari.",
  },
  {
    number: "03",
    title: "Kotagede & kuliner lokal",
    distance: "20 menit berkendara",
    desc: "Jelajahi lorong bersejarah, pengrajin perak, dan cita rasa yang diwariskan lintas generasi.",
  },
];

export default function FacilitiesPage() {
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
            <Link href="/fasilitas" className="text-[#0F2334] font-semibold">
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
      <section className="max-w-6xl w-full mx-auto px-6 pt-10 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-4">
            <nav className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <Link href="/" className="hover:text-stone-600">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-stone-600">Fasilitas & pengalaman</span>
            </nav>

            <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold pt-2">
              RUANG UNTUK SETIAP MOMEN
            </span>

            <h1 className="font-serif text-3xl md:text-5xl text-[#0F2334] leading-tight">
              Bukan hanya menginap. Ini waktu Anda.
            </h1>

            <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
              Dari pagi yang hangat hingga sore di tepi kolam, temukan kenyamanan
              yang sederhana dan pengalaman yang dekat.
            </p>

            <div className="pt-1">
              <span className="inline-block bg-[#EFE9DD] text-amber-900 text-[11px] font-medium px-3 py-1 rounded">
                Fasilitas untuk seluruh tamu
              </span>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:col-span-7 h-72 md:h-[360px] rounded-md overflow-hidden bg-stone-200 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
              alt="Suasana Kolam dan Bangunan Nestra Hotel"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. FACILITY FEATURE CARDS */}
      <section className="max-w-6xl w-full mx-auto px-6 pb-16 space-y-8">
        {FACILITY_CARDS.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-md border border-stone-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch"
          >
            {/* Image Column */}
            <div
              className={`md:col-span-5 h-64 md:h-auto min-h-[280px] bg-stone-200 overflow-hidden ${
                card.imagePosition === "right" ? "md:order-2" : "md:order-1"
              }`}
            >
              <img
                src={card.image}
                alt={card.imageAlt}
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>

            {/* Content Column */}
            <div
              className={`md:col-span-7 p-8 md:p-10 flex flex-col justify-center space-y-4 ${
                card.imagePosition === "right" ? "md:order-1" : "md:order-2"
              }`}
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
                {card.category}
              </span>

              <h2 className="font-serif text-2xl md:text-3xl text-[#0F2334]">
                {card.title}
              </h2>

              <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                {card.description}
              </p>

              <div className="pt-3 border-t border-stone-100 space-y-4">
                <p className="text-[11px] font-medium text-stone-500">
                  {card.schedule}
                </p>

                {card.ctaText && card.ctaHref && (
                  <div>
                    <Link
                      href={card.ctaHref}
                      className="inline-block border border-stone-300 bg-white hover:bg-stone-50 text-[#0F2334] px-4 py-2 rounded text-xs font-medium transition"
                    >
                      {card.ctaText}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 4. DETAIL YANG MEMUDAHKAN HARI ANDA */}
      <section className="bg-white border-t border-b border-stone-200/80 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-2xl md:text-3xl text-[#0F2334] mb-10">
            Detail yang memudahkan hari Anda.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {CONVENIENCE_ITEMS.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-base text-amber-800">{item.icon}</div>
                <h3 className="text-xs font-bold text-[#0F2334]">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LOCAL EXPERIENCE ("Yogyakarta, dengan cara Anda sendiri.") */}
      <section className="max-w-6xl w-full mx-auto px-6 py-20 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Photo Tugu Yogyakarta */}
          <div className="md:col-span-6 h-64 md:h-80 rounded-md overflow-hidden bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1000&q=80"
              alt="Suasana Tugu Yogyakarta"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text & CTA */}
          <div className="md:col-span-6 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
              DEKAT DARI NESTRA
            </span>

            <h2 className="font-serif text-3xl text-[#0F2334] leading-snug">
              Yogyakarta, dengan cara Anda sendiri.
            </h2>

            <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
              Temukan budaya, rasa, dan sudut kota yang mengesankan. Tim kami
              siap membantu dengan rute, rekomendasi, dan transportasi.
            </p>

            <div className="pt-2">
              <Link
                href="/kontak?topik=rekomendasi"
                className="inline-flex items-center gap-2 border border-stone-300 bg-white hover:bg-stone-50 text-[#0F2334] px-4 py-2.5 rounded text-xs font-medium transition"
              >
                <span>Minta rekomendasi lokal</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Numbered Local Highlights */}
        <div className="pt-6 border-t border-stone-200/80 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LOCAL_DESTINATIONS.map((dest) => (
              <div key={dest.number} className="space-y-1.5">
                <span className="block text-[11px] font-bold text-amber-800">
                  {dest.number}
                </span>
                <h3 className="font-serif text-lg text-[#0F2334]">
                  {dest.title}
                </h3>
                <p className="text-[11px] font-medium text-stone-500">
                  {dest.distance}
                </p>
                <p className="text-xs text-stone-600 leading-relaxed pt-1">
                  {dest.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-stone-400">
            Perkiraan waktu tempuh dari hotel. Transportasi dan kegiatan dapat
            diatur melalui resepsionis.
          </p>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section className="bg-[#EFE9DD] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-serif text-xl md:text-2xl text-[#0F2334]">
            Simpan waktu untuk hal yang Anda sukai.
          </h2>
          <Link
            href="/kamar"
            className="bg-[#0F2334] hover:bg-[#19354d] text-white px-5 py-2.5 rounded text-xs font-medium transition inline-flex items-center gap-2"
          >
            <span>Rencanakan menginap</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* 7. FULL FOOTER */}
      <footer className="bg-[#0F2334] text-stone-300 pt-14 pb-8 text-xs">
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