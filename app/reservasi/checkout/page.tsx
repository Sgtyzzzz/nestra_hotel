"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutGuestPage() {
  const router = useRouter();

  // State Form Data Pemesan
  const [formData, setFormData] = useState({
    firstName: "Aditya",
    lastName: "Pratama",
    email: "aditya.pratama@email.id",
    countryCode: "Indonesia (+62)",
    phone: "812 3456 7890",
    isSameGuest: true,
    guestFullName: "",
    arrivalTime: "14.00–15.00 WIB",
    guestCount: "2 dewasa • 0 anak",
    specialRequest: "Kamar di lantai atas dan jauh dari lift, jika tersedia.",
    needCompanyInvoice: false,
    companyName: "",
    companyTaxId: "",
  });

  // Cek apakah data kontak wajib sudah lengkap
  const isContactComplete =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.includes("@") &&
    formData.phone.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isContactComplete) return;

    // Simpan sementara ke sessionStorage agar bisa dibaca di halaman Pembayaran (Step 3)
    sessionStorage.setItem("nestra_booking_guest", JSON.stringify(formData));
    router.push("/reservasi/pembayaran");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-[#1A202C]">
      {/* 1. NAVBAR */}
      <header className="bg-white border-b border-stone-200">
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
            <Link href="/kamar" className="text-[#0F2334] font-semibold">
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

      {/* 2. STEPPER PROGRESS BAR */}
      <div className="bg-white border-b border-stone-200 py-4">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-xs">
          {/* Step 1: Done */}
          <div className="flex items-center gap-2 text-stone-600">
            <span className="w-6 h-6 rounded-full bg-[#0F2334] text-white flex items-center justify-center text-[11px] font-bold">
              ✓
            </span>
            <span className="hidden sm:inline">Pilih kamar</span>
          </div>

          <div className="h-[1px] flex-1 bg-stone-200 mx-3" />

          {/* Step 2: Active */}
          <div className="flex items-center gap-2 font-semibold text-[#0F2334]">
            <span className="w-6 h-6 rounded-full bg-[#0F2334] text-white flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>Data tamu</span>
          </div>

          <div className="h-[1px] flex-1 bg-stone-200 mx-3" />

          {/* Step 3: Pending */}
          <div className="flex items-center gap-2 text-stone-400">
            <span className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center text-[11px] font-medium">
              3
            </span>
            <span className="hidden sm:inline">Pembayaran</span>
          </div>

          <div className="h-[1px] flex-1 bg-stone-200 mx-3" />

          {/* Step 4: Pending */}
          <div className="flex items-center gap-2 text-stone-400">
            <span className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center text-[11px] font-medium">
              4
            </span>
            <span className="hidden sm:inline">Konfirmasi</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* LEFT FORM COLUMN (8 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#0F2334]">
              Siapa yang akan menginap?
            </h1>
            <p className="text-xs text-stone-500 mt-1.5">
              Lengkapi data Anda. Konfirmasi dan informasi menginap akan dikirim
              melalui email.
            </p>
          </div>

          {/* Login Info Banner */}
          <div className="bg-[#EEF2F5] px-4 py-3 rounded-md border border-slate-200/80 flex items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 font-bold">ⓘ</span>
              <p>
                Sudah punya akun? Masuk untuk mengisi data lebih cepat dan
                menyimpan reservasi Anda.
              </p>
            </div>
            <Link
              href="/login"
              className="text-[#0F2334] font-semibold hover:underline shrink-0"
            >
              Masuk
            </Link>
          </div>

          {/* CARD 1: DATA PEMESAN */}
          <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-5">
            <div>
              <h2 className="font-serif text-xl text-[#0F2334]">
                Data pemesan
              </h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Kolom bertanda * wajib diisi. Gunakan nama sesuai kartu identitas.
              </p>
            </div>

            {/* Nama Depan & Belakang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Nama depan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Contoh: Aditya"
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Nama belakang *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Contoh: Pratama"
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                Alamat email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="nama@email.com"
                className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
              />
              <span className="block text-[10px] text-stone-400 mt-1">
                Konfirmasi reservasi dikirim ke alamat ini.
              </span>
            </div>

            {/* Kode Negara & Nomor Ponsel */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Kode negara
                </label>
                <select
                  value={formData.countryCode}
                  onChange={(e) =>
                    setFormData({ ...formData, countryCode: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 bg-white focus:outline-none focus:border-[#0F2334]"
                >
                  <option>Indonesia (+62)</option>
                  <option>Singapura (+65)</option>
                  <option>Malaysia (+60)</option>
                </select>
              </div>
              <div className="sm:col-span-7">
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Nomor ponsel *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="812 3456 7890"
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                />
                <span className="block text-[10px] text-stone-400 mt-1">
                  Nomor aktif untuk informasi kedatangan.
                </span>
              </div>
            </div>

            {/* Checkbox Tamu Utama */}
            <div className="pt-1 space-y-3">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSameGuest}
                  onChange={(e) =>
                    setFormData({ ...formData, isSameGuest: e.target.checked })
                  }
                  className="accent-[#0F2334] rounded"
                />
                <span>Saya adalah tamu yang akan menginap</span>
              </label>

              {!formData.isSameGuest && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                    Nama lengkap tamu yang menginap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guestFullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guestFullName: e.target.value,
                      })
                    }
                    placeholder="Masukkan nama lengkap tamu"
                    className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                  />
                </div>
              )}
            </div>

            {/* Status Validation Banner */}
            {isContactComplete ? (
              <div className="bg-emerald-50/80 border border-emerald-200/80 px-4 py-3 rounded flex items-center gap-2.5 text-xs text-emerald-800">
                <span className="font-bold">✓</span>
                <span>
                  Data kontak lengkap. Anda dapat melanjutkan ke pembayaran.
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded flex items-center gap-2.5 text-xs text-amber-800">
                <span className="font-bold">!</span>
                <span>
                  Lengkapi seluruh kolom bertanda * untuk melanjutkan.
                </span>
              </div>
            )}
          </div>

          {/* CARD 2: PREFERENSI MENGINAP */}
          <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-5">
            <h2 className="font-serif text-xl text-[#0F2334]">
              Preferensi menginap
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Perkiraan kedatangan
                </label>
                <select
                  value={formData.arrivalTime}
                  onChange={(e) =>
                    setFormData({ ...formData, arrivalTime: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 bg-white focus:outline-none focus:border-[#0F2334]"
                >
                  <option>14.00–15.00 WIB</option>
                  <option>15.00–18.00 WIB</option>
                  <option>18.00–21.00 WIB</option>
                  <option>Setelah 21.00 WIB</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                  Jumlah tamu
                </label>
                <select
                  value={formData.guestCount}
                  onChange={(e) =>
                    setFormData({ ...formData, guestCount: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 bg-white focus:outline-none focus:border-[#0F2334]"
                >
                  <option>1 dewasa • 0 anak</option>
                  <option>2 dewasa • 0 anak</option>
                  <option>2 dewasa • 1 anak</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                Permintaan khusus (opsional)
              </label>
              <textarea
                rows={3}
                value={formData.specialRequest}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequest: e.target.value })
                }
                placeholder="Tuliskan permintaan khusus Anda..."
                className="w-full border border-stone-200 rounded px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
              />
              <span className="block text-[10px] text-stone-400 mt-1">
                Permintaan bergantung pada ketersediaan dan tidak dapat dijamin.
              </span>
            </div>

            {/* Checkbox Faktur Perusahaan */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needCompanyInvoice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      needCompanyInvoice: e.target.checked,
                    })
                  }
                  className="accent-[#0F2334] rounded"
                />
                <span>Saya memerlukan faktur atas nama perusahaan</span>
              </label>

              {formData.needCompanyInvoice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <input
                    type="text"
                    placeholder="Nama perusahaan"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                  />
                  <input
                    type="text"
                    placeholder="NPWP (opsional)"
                    value={formData.companyTaxId}
                    onChange={(e) =>
                      setFormData({ ...formData, companyTaxId: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#0F2334]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Terms & Bottom Navigation */}
          <div className="space-y-4 pt-1">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Dengan melanjutkan, Anda menyetujui syarat & ketentuan reservasi
              dan kebijakan privasi Nestra Hotel. Data hanya digunakan untuk
              kebutuhan menginap Anda.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href="/kamar/deluks"
                className="text-xs font-medium text-stone-600 hover:text-[#0F2334] inline-flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Kembali ke kamar</span>
              </Link>

              <button
                type="submit"
                disabled={!isContactComplete}
                className="bg-[#0F2334] hover:bg-[#19354d] disabled:bg-stone-300 text-white px-6 py-3 rounded text-xs font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke pembayaran</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </form>

        {/* RIGHT SIDEBAR: RINGKASAN MENGINAP (4 Cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-md border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif text-lg text-[#0F2334]">
              Ringkasan menginap
            </h2>

            <div className="h-32 rounded overflow-hidden bg-stone-200">
              <img
                src="/images/room-deluxe.jpg"
                alt="Ringkasan Kamar Deluks"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#0F2334]">
                Nestra Hotel Yogyakarta
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Deluks • Ranjang besar
              </p>
              <p className="text-[11px] text-stone-500">
                2 dewasa • 1 kamar • 2 malam
              </p>
            </div>

            {/* Check-in / Check-out */}
            <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Masuk</span>
                <span className="font-medium text-stone-800">
                  16 Okt 2026, 14.00
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Keluar</span>
                <span className="font-medium text-stone-800">
                  18 Okt 2026, 12.00
                </span>
              </div>
              <div className="pt-1">
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded">
                  Sarapan untuk 2 orang
                </span>
              </div>
            </div>

            {/* Rincian Biaya */}
            <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Rp850.000 × 2 malam</span>
                <span>Rp1.700.000</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Pajak & layanan (11%)</span>
                <span>Rp187.000</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-stone-200">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-stone-700">
                  Total pembayaran
                </span>
                <span className="font-serif text-xl font-bold text-[#0F2334]">
                  Rp1.887.000
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Harga dalam Rupiah. Tidak ada biaya tersembunyi.
              </p>
            </div>

            <p className="text-[10px] text-emerald-700 font-medium pt-1 border-t border-stone-100">
              Pembatalan gratis hingga 14 Okt 2026, 18.00 WIB.
            </p>
          </div>

          {/* Bantuan Reservasi Card */}
          <div className="bg-white p-5 rounded-md border border-stone-200/90 space-y-1.5">
            <h3 className="font-serif text-base text-[#0F2334]">
              Bantuan reservasi
            </h3>
            <p className="text-[11px] text-stone-500">
              Tim kami siap membantu 24 jam.
            </p>
            <p className="text-xs font-semibold text-[#0F2334] pt-1">
              +62 274 582 100 • halo@nestrahotel.id
            </p>
          </div>
        </aside>
      </main>

      {/* 4. COMPACT FOOTER */}
      <footer className="bg-[#0F2334] text-stone-400 py-5 text-[11px] mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
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