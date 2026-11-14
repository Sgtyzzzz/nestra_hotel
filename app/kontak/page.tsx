"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    topic: "Pertanyaan reservasi",
    bookingCode: "",
    message: "",
    agreed: false,
  });

  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage("Mohon lengkapi nama lengkap, email, dan pesan Anda.");
      return;
    }

    if (!formData.agreed) {
      setErrorMessage(
        "Silakan centang persetujuan penggunaan data terlebih dahulu."
      );
      return;
    }

    setErrorMessage("");
    setIsSending(true);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          topic: formData.topic,
          bookingCode: formData.bookingCode.trim() || null,
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal mengirim pesan. Silakan coba lagi.");
        return;
      }

      setIsSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        topic: "Pertanyaan reservasi",
        bookingCode: "",
        message: "",
        agreed: false,
      });
    } catch {
      setErrorMessage("Terjadi gangguan koneksi ke server.");
    } finally {
      setIsSending(false);
    }
  };

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
            <Link href="/kamar" className="hover:text-[#0F2334] transition">
              Kamar
            </Link>
            <Link href="/fasilitas" className="hover:text-[#0F2334] transition">
              Fasilitas & pengalaman
            </Link>
            <Link href="/penawaran" className="hover:text-[#0F2334] transition">
              Penawaran
            </Link>
            <Link
              href="/kontak"
              className="text-[#0F2334] font-semibold transition"
            >
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

      {/* HERO / PAGE HEADER */}
      <section className="bg-white border-b border-stone-200/80 py-14">
        <div className="max-w-6xl mx-auto px-6 space-y-3">
          <span className="block text-[11px] uppercase tracking-[0.2em] text-[#9A7B4F] font-semibold">
            KONTAK & LOKASI
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#0F2334]">
            Kami siap membantu rencana menginap Anda.
          </h1>
          <p className="text-xs md:text-sm text-stone-500 max-w-2xl leading-relaxed">
            Punya pertanyaan seputar tipe kamar, penjemputan stasiun, atau
            permintaan khusus? Tim resepsionis kami di Yogyakarta merespons
            setiap pesan dalam waktu kurang dari 2 jam.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start flex-1">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-md border border-stone-200/90 space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-[#0F2334]">Kirim pesan</h2>
            <p className="text-xs text-stone-500 mt-1">
              Isi formulir di bawah ini dan kami akan segera menghubungi Anda
              melalui email.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <h3 className="font-serif text-lg font-semibold">
                  Pesan Anda telah terkirim
                </h3>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Terima kasih telah menghubungi Nestra Hotel Yogyakarta. Tim
                kami telah menerima pesan Anda dan akan segera membalas ke
                alamat email yang dicantumkan.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-2 inline-block border border-emerald-700 text-emerald-800 hover:bg-emerald-100 px-4 py-2 rounded text-xs font-medium transition cursor-pointer"
              >
                Kirim pesan lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#0F2334]">
                    Nama lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Contoh: Aditya Pratama"
                    className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#0F2334]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#0F2334]">
                    Alamat email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="nama@email.com"
                    className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#0F2334]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#0F2334]">
                    Topik pertanyaan
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
                  >
                    <option value="Pertanyaan reservasi">
                      Pertanyaan reservasi
                    </option>
                    <option value="Perubahan jadwal / pembatalan">
                      Perubahan jadwal / pembatalan
                    </option>
                    <option value="Layanan antar-jemput bandara & stasiun">
                      Layanan antar-jemput bandara & stasiun
                    </option>
                    <option value="Fasilitas & acara privat">
                      Fasilitas & acara privat
                    </option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#0F2334]">
                    Nomor reservasi (opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.bookingCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bookingCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Contoh: NST-261016-0842"
                    className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs uppercase focus:outline-none focus:border-[#0F2334]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0F2334]">
                  Pesan Anda *
                </label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tuliskan detail pertanyaan atau kebutuhan menginap Anda..."
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#0F2334]"
                />
              </div>

              <label className="flex items-start gap-2.5 text-[11px] text-stone-500 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.agreed}
                  onChange={(e) =>
                    setFormData({ ...formData, agreed: e.target.checked })
                  }
                  className="mt-0.5 accent-[#0F2334]"
                />
                <span>
                  Saya menyetujui bahwa data ini digunakan oleh tim Nestra
                  Hotel untuk menindaklanjuti pertanyaan saya.
                </span>
              </label>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="bg-[#0F2334] hover:bg-[#19354d] disabled:bg-stone-400 text-white px-6 py-3 rounded text-xs font-semibold transition cursor-pointer"
              >
                {isSending ? "Mengirim pesan..." : "Kirim pesan"}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: HOTEL INFO & MAP */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-5">
            <h2 className="font-serif text-xl text-[#0F2334]">
              Informasi kontak langsung
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                  ALAMAT HOTEL
                </span>
                <p className="text-[#0F2334] font-medium mt-1 leading-relaxed">
                  Jl. Mangkubumi No. 28, Gowongan, Kec. Jetis, Kota Yogyakarta,
                  Daerah Istimewa Yogyakarta 55232
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    TELEPON & WHATSAPP
                  </span>
                  <p className="text-[#0F2334] font-semibold mt-1">
                    +62 274 582 100
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Resepsionis 24 jam
                  </p>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    EMAIL RESERVASI
                  </span>
                  <p className="text-[#0F2334] font-semibold mt-1">
                    halo@nestrahotel.id
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Respons &lt; 2 jam
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                  AKSES TRANSPORTASI TERDEKAT
                </span>
                <ul className="text-stone-600 space-y-1 text-[11px]">
                  <li>• 4 menit berjalan kaki ke Tugu Yogyakarta</li>
                  <li>• 6 menit berkendara dari Stasiun Tugu Yogyakarta</li>
                  <li>
                    • 45 menit berkendara dari Bandara Internasional Yogyakarta
                    (YIA)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* EMBED MAP */}
          <div className="bg-white p-3 rounded-md border border-stone-200/90 space-y-2">
            <div className="w-full h-56 rounded overflow-hidden bg-stone-200">
              <iframe
                title="Lokasi Nestra Hotel Yogyakarta"
                src="https://www.openstreetmap.org/export/embed.html?bbox=110.3625%2C-7.7885%2C110.3715%2C-7.7815&layer=mapnik&marker=-7.7850%2C110.3670"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between px-1 py-1 text-[11px] text-stone-500">
              <span>Kawasan Tugu – Mangkubumi, Yogyakarta</span>
              <a
                href="https://maps.google.com/?q=-7.7850,110.3670"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F2334] font-semibold hover:underline"
              >
                Buka peta ↗
              </a>
            </div>
          </div>
        </aside>
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