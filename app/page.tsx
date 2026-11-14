"use client";

import React, { useState } from "react";
import Link from "next/link";

// Data Dummy sementara sebelum disambungkan ke API NestJS (/api/rooms)
const ROOMS_DATA = [
  {
    id: "superior",
    name: "Superior",
    specs: "24 m² • 1 Queen Bed • 2 Tamu",
    price: "Rp650.000",
    image: "/images/room-superior.jpg",
  },
  {
    id: "deluxe",
    name: "Deluxe",
    specs: "32 m² • 1 King Bed • 2 Tamu",
    price: "Rp850.000",
    image: "/images/room-deluxe.jpg",
  },
  {
    id: "family",
    name: "Kamar Keluarga",
    specs: "45 m² • 2 Queen Bed • 4 Tamu",
    price: "Rp1.150.000",
    image: "/images/room-family.jpg",
  },
];

const FAQ_DATA = [
  {
    q: "Kapan waktu check-in dan check-out?",
    a: "Waktu check-in dimulai pukul 14.00 WIB dan check-out maksimal pukul 12.00 WIB. Permintaan check-in lebih awal menyesuaikan ketersediaan kamar.",
  },
  {
    q: "Apakah harga sudah termasuk sarapan?",
    a: "Beberapa paket kamar sudah termasuk sarapan untuk 2 orang. Detail fasilitas sarapan tertera jelas saat Anda memilih tipe kamar.",
  },
  {
    q: "Bagaimana kebijakan pembatalan?",
    a: "Pembatalan gratis dapat dilakukan hingga 24 jam sebelum tanggal check-in untuk pemesanan langsung melalui situs web resmi Nestra Hotel.",
  },
  {
    q: "Apakah tersedia area parkir untuk kendaraan?",
    a: "Ya, kami menyediakan area parkir bawah tanah dan layanan valet gratis khusus untuk tamu yang menginap.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [bookingFilter, setBookingFilter] = useState({
    location: "Nestra Hotel Yogyakarta",
    checkIn: "2026-11-20",
    checkOut: "2026-11-22",
    guests: "2 Dewasa, 1 Kamar",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Nanti diarahkan ke halaman /kamar dengan query params
    console.log("Mencari kamar:", bookingFilter);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
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
            <Link href="/" className="text-[#0F2334] font-semibold">
              Beranda
            </Link>
            <Link href="/kamar" className="hover:text-[#0F2334] transition">
              Kamar
            </Link>
            <Link href="/fasilitas" className="hover:text-[#0F2334] transition">
              Fasilitas & Layanan
            </Link>
            <Link href="/penawaran" className="hover:text-[#0F2334] transition">
              Penawaran
            </Link>
            <Link href="/tentang" className="hover:text-[#0F2334] transition">
              Tentang Kami
            </Link>
          </nav>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/reservasi-saya"
              className="hidden sm:inline text-stone-600 hover:text-[#0F2334]"
            >
              Reservasi Saya
            </Link>
            <Link
              href="/kamar"
              className="bg-[#0F2334] hover:bg-[#19354d] text-white px-5 py-2.5 rounded text-xs font-medium tracking-wide transition"
            >
              Pesan Kamar
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION & FLOATING BOOKING BAR */}
      <section className="relative">
        <div className="relative h-[540px] w-full bg-stone-800">
          {/* Ganti src dengan gambar hero dari Figma */}
          <img
            src="/images/hero-lobby.jpg"
            alt="Interior Lobi Nestra Hotel"
            className="w-full h-full object-cover brightness-[0.65]"
          />
          <div className="absolute inset-0 max-w-6xl mx-auto px-6 flex flex-col justify-center text-white">
            <span className="text-xs uppercase tracking-[0.2em] text-amber-200/90 mb-3">
              Boutique Sanctuary • Yogyakarta
            </span>
            <h1 className="font-serif text-4xl md:text-6xl max-w-xl leading-tight mb-4">
              Singgah dengan tenang. Jelajahi dengan leluasa.
            </h1>
            <p className="text-sm font-medium text-stone-200 mb-1">
              Your Stay, Made Simple.
            </p>
            <p className="text-xs md:text-sm text-stone-300 max-w-md leading-relaxed mb-6">
              Kenyamanan modern yang dirancang hangat untuk istirahat terbaik
              Anda di tengah jantung kota.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-300">
              <span>• Wi-Fi Cepat & Stabil</span>
              <span>• Check-in Fleksibel</span>
            </div>
          </div>
        </div>

        {/* Booking Search Card */}
        <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
          <form
            onSubmit={handleSearch}
            className="bg-white p-5 rounded-md shadow-lg border border-stone-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
          >
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1.5">
                Lokasi
              </label>
              <input
                type="text"
                value={bookingFilter.location}
                onChange={(e) =>
                  setBookingFilter({ ...bookingFilter, location: e.target.value })
                }
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1.5">
                Tanggal Masuk
              </label>
              <input
                type="date"
                value={bookingFilter.checkIn}
                onChange={(e) =>
                  setBookingFilter({ ...bookingFilter, checkIn: e.target.value })
                }
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1.5">
                Tanggal Keluar
              </label>
              <input
                type="date"
                value={bookingFilter.checkOut}
                onChange={(e) =>
                  setBookingFilter({ ...bookingFilter, checkOut: e.target.value })
                }
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1.5">
                Tamu & Kamar
              </label>
              <select
                value={bookingFilter.guests}
                onChange={(e) =>
                  setBookingFilter({ ...bookingFilter, guests: e.target.value })
                }
                className="w-full border border-stone-200 rounded px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
              >
                <option>1 Dewasa, 1 Kamar</option>
                <option>2 Dewasa, 1 Kamar</option>
                <option>2 Dewasa, 2 Anak, 1 Kamar</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0F2334] hover:bg-[#19354d] text-white py-2.5 px-4 rounded text-xs font-medium transition cursor-pointer"
            >
              Cari Kamar →
            </button>
          </form>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION ("Hal-hal sederhana, yang membuat betah.") */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-12 border-b border-stone-200">
          <h2 className="font-serif text-3xl text-[#0F2334] max-w-xs leading-snug">
            Hal-hal sederhana, yang membuat betah.
          </h2>
          <p className="text-xs md:text-sm text-stone-500 max-w-md leading-relaxed">
            Dari kamar yang bersih hingga pelayanan yang hangat, kami merawat
            detail kecil agar Anda bisa beristirahat tanpa gangguan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-10">
          {[
            {
              title: "Dirancang higienis",
              desc: "Standar kebersihan menyeluruh sebelum Anda tiba.",
            },
            {
              title: "Nyaman tanpa berlebihan",
              desc: "Kasur berkualitas dan pencahayaan hangat yang menenangkan.",
            },
            {
              title: "Pagi yang lebih baik",
              desc: "Sarapan segar pilihan lokal disajikan setiap hari.",
            },
            {
              title: "Mulai sejak awal",
              desc: "Proses reservasi ringkas dengan dukungan resepsionis 24 jam.",
            },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="w-7 h-7 rounded-full bg-[#F6F2EA] text-amber-800 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <h3 className="font-semibold text-sm text-[#0F2334]">
                {item.title}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ROOM SHOWCASE ("Kamar yang pas untuk Anda.") */}
      <section className="bg-[#F6F2EA] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
                Pilihan Akomodasi
              </span>
              <h2 className="font-serif text-3xl text-[#0F2334] mt-1">
                Kamar yang pas untuk Anda.
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Setiap ruang dirancang untuk ketenangan setelah seharian beraktivitas.
              </p>
            </div>
            <Link
              href="/kamar"
              className="inline-flex items-center gap-2 border border-stone-300 bg-white px-4 py-2 rounded text-xs font-medium text-[#0F2334] hover:bg-stone-50 transition self-start"
            >
              Lihat semua kamar →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROOMS_DATA.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-md overflow-hidden border border-stone-200/70 flex flex-col"
              >
                <div className="h-52 bg-stone-200 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-[#0F2334]">
                      {room.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">{room.specs}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-stone-400">
                        Mulai dari
                      </span>
                      <span className="font-bold text-sm text-[#0F2334]">
                        {room.price}
                      </span>
                      <span className="text-[10px] text-stone-400"> /malam</span>
                    </div>
                    <Link
                      href={`/kamar/${room.id}`}
                      className="text-xs font-semibold text-[#0F2334] hover:underline"
                    >
                      Lihat detail →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-stone-500 mt-6">
            *Harga dapat berubah sesuai tanggal menginap dan ketersediaan kamar.
          </p>
        </div>
      </section>

      {/* 5. FACILITIES ("Luangkan waktu. Nikmati ritmenya.") */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="h-[380px] rounded-md overflow-hidden bg-stone-200">
            <img
              src="/images/pool-courtyard.jpg"
              alt="Kolam Renang Nestra Hotel"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
              Suasana & Fasilitas
            </span>
            <h2 className="font-serif text-3xl text-[#0F2334] leading-snug">
              Luangkan waktu. Nikmati ritmenya.
            </h2>
            <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
              Mulai pagi dengan berenang santai, bekerja dari lounge yang tenang,
              atau sekadar menikmati kopi sore di taman dalam hotel kami.
            </p>
            <p className="text-xs text-stone-500">
              Kolam Renang Terbuka • Restoran & Kafe • Ruang Kerja Tenang • Layanan Kamar 24 Jam
            </p>
            <div className="pt-2">
              <Link
                href="/fasilitas"
                className="inline-block border border-stone-300 px-5 py-2.5 rounded text-xs font-medium text-[#0F2334] hover:bg-stone-50 transition"
              >
                Jelajahi Fasilitas →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SPECIAL OFFERS ("Ada alasan untuk tinggal lebih lama.") */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
          Penawaran Spesial
        </span>
        <h2 className="font-serif text-3xl text-[#0F2334] mt-1 mb-8">
          Ada alasan untuk tinggal lebih lama.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-4 rounded-md overflow-hidden bg-stone-200 min-h-[220px]">
            <img
              src="/images/breakfast-promo.jpg"
              alt="Sarapan di Nestra Hotel"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:col-span-5 bg-[#0F2334] text-white p-7 rounded-md flex flex-col justify-between">
            <div>
              <span className="inline-block bg-amber-200/20 text-amber-200 text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider mb-3">
                Paket Akhir Pekan
              </span>
              <h3 className="font-serif text-2xl mb-2">
                Akhir pekan, tanpa terburu-buru.
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Menginap minimal 2 malam di akhir pekan, termasuk sarapan untuk
                dua orang dan late check-out hingga pukul 14.00.
              </p>
            </div>
            <div className="mt-6">
              <p className="text-xs text-amber-200 font-semibold mb-3">
                Mulai dari Rp1.250.000 / 2 malam
              </p>
              <Link
                href="/penawaran"
                className="inline-block bg-white text-[#0F2334] px-4 py-2 rounded text-xs font-semibold hover:bg-stone-100 transition"
              >
                Pilih Paket Ini
              </Link>
            </div>
          </div>

          <div className="md:col-span-3 bg-[#EFE9DD] p-7 rounded-md flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-xl text-[#0F2334] mb-2">
                Pesan langsung, lebih tenang.
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Dapatkan jaminan harga terbaik dan fleksibilitas ubah jadwal
                tanpa biaya tambahan.
              </p>
            </div>
            <div className="mt-6">
              <p className="text-[11px] text-stone-500 mb-2">
                Berlaku untuk semua tipe kamar.
              </p>
              <Link
                href="/kamar"
                className="text-xs font-semibold text-[#0F2334] hover:underline"
              >
                Cek ketersediaan →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS ("Datang sebagai tamu. Pulang dengan cerita.") */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
              Ulasan Tamu
            </span>
            <h2 className="font-serif text-3xl text-[#0F2334] mt-1">
              Datang sebagai tamu. Pulang dengan cerita.
            </h2>
          </div>
          <div className="sm:text-right">
            <div className="font-serif text-3xl text-[#0F2334]">4,8 / 5</div>
            <div className="text-amber-500 text-xs">★★★★★</div>
            <div className="text-[11px] text-stone-400">
              Berdasarkan 320+ ulasan terverifikasi
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote:
                "“Kamar bersih dan tenang, cocok untuk istirahat setelah seharian keliling kota. Stafnya sangat membantu.”",
              author: "Dewi Anggraini",
              origin: "Jakarta • Menginap 2 malam",
            },
            {
              quote:
                "“Lokasinya strategis tapi suasananya tetap damai. Sarapannya sederhana namun rasanya pas di lidah.”",
              author: "Bima Pratama",
              origin: "Bandung • Menginap 3 malam",
            },
            {
              quote:
                "“Proses check-in cepat tanpa ribet. Desain interiornya hangat, bikin betah berlama-lama di kamar.”",
              author: "Nadia Putri",
              origin: "Surabaya • Menginap 1 malam",
            },
          ].map((rev, i) => (
            <div key={i} className="space-y-3">
              <div className="text-amber-500 text-xs">★★★★★</div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {rev.quote}
              </p>
              <div>
                <p className="text-xs font-bold text-[#0F2334]">{rev.author}</p>
                <p className="text-[11px] text-stone-400">{rev.origin}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. LOCATION ("Di tengah kota. Dekat dengan ceritanya.") */}
      <section className="bg-[#F6F2EA] py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
              Lokasi Strategis
            </span>
            <h2 className="font-serif text-3xl text-[#0F2334] leading-snug">
              Di tengah kota. Dekat dengan ceritanya.
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Akses mudah ke stasiun, pusat kuliner lokal, dan sudut-sudut
              bersejarah yang bisa dijangkau dengan berjalan kaki.
            </p>
            <p className="text-xs font-medium text-[#0F2334]">
              Jl. Mangkubumi No. 42, Gowongan, Jetis, Yogyakarta 55232
            </p>
            <p className="text-[11px] text-stone-500">
              • 5 menit dari Stasiun Tugu • 10 menit menuju Malioboro
            </p>
            <div className="pt-2">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-white border border-stone-300 px-4 py-2 rounded text-xs font-medium text-[#0F2334] hover:bg-stone-50 transition"
              >
                Lihat di Google Maps →
              </a>
            </div>
          </div>

          {/* Placeholder Peta Minimalis */}
          <div className="h-64 bg-[#E6E2D8] rounded-md relative overflow-hidden border border-stone-300/60 flex items-center justify-center">
            <div className="bg-[#0F2334] text-white text-xs px-3.5 py-2 rounded shadow-md font-medium">
              📍 Nestra Hotel
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION ("Yang ingin Anda ketahui.") */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
              Informasi Umum
            </span>
            <h2 className="font-serif text-3xl text-[#0F2334]">
              Yang ingin Anda ketahui.
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Masih ada pertanyaan lain? Tim resepsionis kami siap membantu Anda
              kapan saja.
            </p>
            <Link
              href="/kontak"
              className="inline-block text-xs font-semibold text-[#0F2334] hover:underline pt-1"
            >
              Hubungi kami →
            </Link>
          </div>

          <div className="md:col-span-8 divide-y divide-stone-200 border-t border-b border-stone-200">
            {FAQ_DATA.map((item, index) => (
              <div key={index} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left text-xs md:text-sm font-semibold text-[#0F2334] cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="text-lg font-normal text-stone-400">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>
                {openFaq === index && (
                  <p className="mt-2.5 text-xs text-stone-600 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. BOTTOM CTA BANNER */}
      <section className="bg-[#EFE9DD] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl text-[#0F2334]">
              Perjalanan berikutnya dimulai di sini.
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Pilih tanggal Anda, kami siapkan ruang istirahatnya.
            </p>
          </div>
          <Link
            href="/kamar"
            className="bg-[#0F2334] hover:bg-[#19354d] text-white px-6 py-3 rounded text-xs font-medium transition"
          >
            Pilih Kamar Sekarang →
          </Link>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-[#0F2334] text-stone-300 pt-16 pb-10 text-xs">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div className="space-y-3">
            <div className="font-bold tracking-wider text-white text-sm">
              NESTRA HOTEL
            </div>
            <p className="text-[11px] text-amber-200/80">
              Your Stay, Made Simple.
            </p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Hotel butik modern dengan ketenangan maksimal di pusat kota
              Yogyakarta.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-semibold mb-3">Kontak & Lokasi</div>
            <p className="text-stone-400">
              Jl. Mangkubumi No. 42, Yogyakarta 55232
            </p>
            <p className="text-stone-400">+62 274 555 0192</p>
            <p className="text-stone-400">halo@nestrahotel.id</p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-semibold mb-3">Jelajahi</div>
            <ul className="space-y-1.5 text-stone-400">
              <li><Link href="/kamar" className="hover:text-white">Daftar Kamar</Link></li>
              <li><Link href="/fasilitas" className="hover:text-white">Fasilitas & Layanan</Link></li>
              <li><Link href="/penawaran" className="hover:text-white">Penawaran Spesial</Link></li>
              <li><Link href="/tentang" className="hover:text-white">Tentang Kami</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-white font-semibold mb-3">Bantuan Tamu</div>
            <ul className="space-y-1.5 text-stone-400">
              <li><Link href="/reservasi-saya" className="hover:text-white">Cek Reservasi</Link></li>
              <li><Link href="/kebijakan" className="hover:text-white">Kebijakan Pembatalan</Link></li>
              <li><Link href="/privasi" className="hover:text-white">Kebijakan Privasi</Link></li>
              <li><Link href="/syarat" className="hover:text-white">Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-stone-400 gap-4">
          <p>© 2026 Nestra Hotel. Seluruh hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <span>Instagram</span>
            <span>WhatsApp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}