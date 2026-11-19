"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function GuestHelpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [topic, setTopic] = useState("Permintaan Tambahan Kamar");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSubmitted(false);

    try {
      const res = await fetch("/api/staff/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CONTACT",
          fullName,
          email,
          bookingCode,
          topic: bookingCode ? `${topic} • ${bookingCode}` : topic,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setFullName("");
        setEmail("");
        setBookingCode("");
        setMessage("");
      } else {
        setErrorMsg(data.error || "Gagal mengirim pesan ke resepsionis.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F2334] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/reservasi/reservasi-saya"
            className="text-xs text-stone-500 hover:text-[#0F2334]"
          >
            ← Kembali ke Reservasi Saya
          </Link>
          <span className="text-[10px] tracking-widest uppercase text-[#B8893E] font-semibold">
            NESTRA CARE
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-md p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Pusat Bantuan &amp; Pengaduan Tamu
            </h1>
            <p className="text-xs text-stone-500">
              Pesan Anda langsung terhubung ke meja Front Desk karyawan kami
              untuk penanganan cepat.
            </p>
          </div>

          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded p-4 text-xs">
              ✓ Aduan Anda berhasil dikirim dan sudah masuk ke daftar pesan
              Front Desk.
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai reservasi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-stone-200 rounded px-3 py-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-stone-200 rounded px-3 py-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Nomor Kamar / Kode Booking
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kamar 301 / NST-261016"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  className="w-full border border-stone-200 rounded px-3 py-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Topik Bantuan *
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full border border-stone-200 rounded px-3 py-2.5 bg-white"
                >
                  <option value="Permintaan Tambahan Kamar">
                    Permintaan Tambahan Kamar (Bantal/Handuk)
                  </option>
                  <option value="Keluhan Fasilitas Kamar">
                    Keluhan Fasilitas Kamar (AC/Air/WiFi)
                  </option>
                  <option value="Permintaan Check-in / Check-out">
                    Permintaan Check-in / Check-out
                  </option>
                  <option value="Komplain & Permintaan Refund">
                    Komplain Berat / Permintaan Refund
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Detail Pesan / Keluhan *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Jelaskan kebutuhan atau kendala yang Anda alami..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2.5"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0F2334] hover:bg-[#19354d] text-white font-semibold px-6 py-2.5 rounded cursor-pointer"
            >
              {submitting ? "Mengirim aduan..." : "Kirim ke Resepsionis"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}