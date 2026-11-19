"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

export default function GuestSupportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [topic, setTopic] = useState("Permintaan Layanan Kamar");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (pathname?.startsWith("/staff") || pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !message.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/staff/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CONTACT",
          fullName,
          topic: bookingCode ? `${topic} (${bookingCode})` : topic,
          bookingCode,
          message,
        }),
      });

      if (res.ok) {
        setSent(true);
        setMessage("");
        setTimeout(() => {
          setSent(false);
          setOpen(false);
        }, 2000);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {open && (
        <div className="mb-3 w-80 sm:w-96 bg-white border border-stone-200 rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-[#0F2334] text-white px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-[#C6A267] font-semibold">
                LAYANAN TAMU 24 JAM
              </p>
              <p className="font-serif text-sm font-bold">
                Chat Resepsionis Nestra
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-stone-300 hover:text-white text-sm px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {sent ? (
            <div className="p-6 text-center space-y-2 text-xs">
              <p className="font-bold text-emerald-700 text-sm">
                ✓ Pesan Terkirim ke Resepsionis
              </p>
              <p className="text-stone-500">
                Staf Front Desk kami (Dimas) telah menerima pesan Anda dan
                segera menindaklanjutinya.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Nama Anda *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aditya Pratama"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-stone-200 rounded px-3 py-2 text-[#0F2334]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">
                    Kamar / Booking
                  </label>
                  <input
                    type="text"
                    placeholder="Kamar 305"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    className="w-full border border-stone-200 rounded px-2.5 py-2 text-[#0F2334]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">
                    Kategori
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full border border-stone-200 rounded px-2 py-2 bg-white text-[#0F2334]"
                  >
                    <option value="Permintaan Layanan Kamar">
                      Layanan Kamar
                    </option>
                    <option value="Keluhan Fasilitas">Keluhan Fasilitas</option>
                    <option value="Check-in / Check-out">
                      Check-in / Out
                    </option>
                    <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Pesan / Keluhan *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan permintaan atau kendala Anda..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-stone-200 rounded px-3 py-2 text-[#0F2334]"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#0F2334] hover:bg-[#19354d] text-white font-semibold py-2.5 rounded cursor-pointer"
              >
                {sending ? "Mengirim..." : "Kirim ke Resepsionis"}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-[#0F2334] hover:bg-[#19354d] text-white border border-[#C6A267]/50 shadow-lg px-4 py-3 rounded-full flex items-center gap-2 text-xs font-semibold cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Bantuan &amp; Aduan Tamu</span>
      </button>
    </div>
  );
}