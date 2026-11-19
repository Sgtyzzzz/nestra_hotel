"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface RecommendedRoom {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  basePrice: number;
  imageUrl: string;
  remainingRooms: number;
}

interface CreatedBooking {
  bookingCode: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  guestEmail: string;
}

interface RouteCard {
  origin: string;
  destination: string;
  mapsUrl: string;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  timestamp: string;
  recommendedRooms?: RecommendedRoom[];
  createdBooking?: CreatedBooking | null;
  routeCard?: RouteCard | null;
  helpful?: boolean;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatNiaPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Halo, selamat datang di Nestra! Saya NIA, resepsionis virtual Anda. Ada yang bisa saya bantu hari ini?",
      timestamp: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === "welcome-1" && !m.timestamp
          ? { ...m, timestamp: getCurrentTime() }
          : m
      )
    );
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: getCurrentTime(),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory
            .filter((m) => !m.id.startsWith("welcome-"))
            .map((m) => ({
              role: m.role === "user" ? "user" : "model",
              text: m.text,
            })),
        }),
      });

      const data = await res.json();

      const recommendedRooms =
        data.uiData?.type === "rooms"
          ? data.uiData.rooms.map((r: any) => ({
              id: r.id,
              slug: r.slug || r.name.toLowerCase().replace(/\s+/g, "-"),
              name: r.name,
              tagline: r.tagline,
              basePrice: r.pricePerNight ?? r.basePrice ?? 0,
              imageUrl: r.imageUrl,
              remainingRooms: r.totalUnits ?? r.remainingRooms ?? 5,
            }))
          : data.recommendedRooms || [];

      const createdBooking =
        data.uiData?.type === "booking" && data.uiData.booking
          ? {
              bookingCode: data.uiData.booking.bookingCode,
              roomName: data.uiData.booking.roomName,
              checkIn: data.uiData.booking.checkIn,
              checkOut: data.uiData.booking.checkOut,
              nights: data.uiData.booking.nights,
              totalAmount:
                data.uiData.booking.totalPrice ??
                data.uiData.booking.totalAmount ??
                0,
              guestEmail: data.uiData.booking.guestEmail,
            }
          : data.createdBooking || null;

      const routeCard =
        data.uiData?.type === "route" && data.uiData.route
          ? {
              origin: data.uiData.route.origin,
              destination: data.uiData.route.destination,
              mapsUrl: data.uiData.route.mapsUrl,
            }
          : data.routeCard || null;

      const activeGuestEmail =
        createdBooking?.guestEmail || data.uiData?.newEmail;
      if (activeGuestEmail) {
        sessionStorage.setItem(
          "nestra_booking_guest",
          JSON.stringify({ email: activeGuestEmail })
        );
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text:
          data.reply ||
          data.error ||
          "Maaf, saya sedang mengalami kendala koneksi.",
        timestamp: getCurrentTime(),
        recommendedRooms,
        createdBooking,
        routeCard,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "Maaf, koneksi ke server terputus. Silakan coba beberapa saat lagi.",
          timestamp: getCurrentTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: "Halo, selamat datang kembali di Nestra! Saya Nia, resepsionis virtual Anda. Ada yang bisa saya bantu hari ini?",
        timestamp: getCurrentTime(),
      },
    ]);
  };

  const toggleHelpful = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, helpful: !m.helpful } : m))
    );
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
            <Link href="/kamar" className="hover:text-[#0F2334]">
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
            <Link href="/chat" className="text-[#0F2334] font-semibold">
              Chat Nia
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
        {/* HEADER HALAMAN */}
        <div className="space-y-1.5">
          <span className="block text-[10px] font-bold tracking-[0.18em] text-[#9A7840] uppercase">
            BANTUAN TAMU • NESTRA HOTEL
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#0F2334]">
            Menginap lebih mudah bersama Nia.
          </h1>
          <p className="text-xs text-stone-500">
            Resepsionis virtual Anda untuk pilihan kamar, rencana menginap, dan
            cerita Yogyakarta.
          </p>
        </div>

        {/* LAYOUT 2 KOLOM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* SIDEBAR KIRI */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Kartu Profil Nia */}
            <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#C6A267]/50 flex items-center justify-center font-serif text-2xl font-bold text-[#0F2334]">
                N
              </div>
              <div>
                <h2 className="font-serif text-xl text-[#0F2334]">
                  Halo, saya NIA.
                </h2>
                <p className="text-[10px] font-semibold text-[#9A7840]">
                  Nestra Interactive Assistant
                </p>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Teman tanya Anda sebelum dan selama menginap. Ceritakan kebutuhan
                Anda, ya.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Asisten AI • Tersedia 24/7</span>
              </div>
            </div>

            {/* Menu Topik Cepat */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#0F2334]">
                Apa yang ingin Anda ketahui?
              </p>

              {[
                {
                  title: "Kamar & reservasi",
                  desc: "Temukan kamar yang pas",
                  prompt:
                    "Halo Nia, bisa rekomendasikan tipe kamar yang tersedia beserta harganya?",
                },
                {
                  title: "Fasilitas hotel",
                  desc: "Lengkapi pengalaman menginap",
                  prompt:
                    "Apa saja fasilitas dan layanan yang tersedia di Nestra Hotel?",
                },
                {
                  title: "Jelajahi Yogyakarta",
                  desc: "Inspirasi & rute ke hotel",
                  prompt:
                    "Nia, saya sudah di Malioboro, rute ke Nestra Hotel lewat mana ya?",
                },
              ].map((topic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(topic.prompt)}
                  className="w-full text-left bg-white hover:bg-[#FAF7F2] border border-stone-200/90 rounded-md p-3.5 flex items-center justify-between transition cursor-pointer"
                >
                  <div>
                    <span className="block text-xs font-semibold text-[#0F2334]">
                      {topic.title}
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      {topic.desc}
                    </span>
                  </div>
                  <span className="text-stone-400 text-xs">›</span>
                </button>
              ))}
            </div>

            {/* Kontak Resepsionis Langsung */}
            <div className="bg-[#EFECE6]/70 border border-stone-200/80 rounded-md p-4 space-y-1.5 text-[11px]">
              <p className="font-semibold text-[#0F2334]">
                Lebih nyaman bicara langsung?
              </p>
              <p className="text-[10px] text-stone-500">
                Tim resepsionis juga siap membantu Anda.
              </p>
              <Link
                href="/kontak"
                className="inline-block font-semibold text-[#0F2334] hover:underline pt-1"
              >
                Hubungi resepsionis →
              </Link>
              <p className="text-[10px] text-stone-500">+62 274 582 100</p>
            </div>
          </aside>

          {/* RUANG CHAT KANAN */}
          <section className="lg:col-span-9 bg-white border border-stone-200/90 rounded-md flex flex-col overflow-hidden">
            {/* Header Kotak Chat */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0F2334] text-[#E5C687] flex items-center justify-center font-serif font-bold text-sm">
                  N
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F2334]">NIA</h3>
                  <p className="text-[10px] text-stone-400">
                    Nestra Interactive Assistant • Asisten AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-[#FAF7F2] border border-stone-200 text-stone-600 text-[10px] font-medium px-2.5 py-1 rounded">
                  Bahasa Indonesia
                </span>
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="border border-stone-200 hover:border-[#0F2334] text-stone-600 text-[10px] font-medium px-2.5 py-1 rounded transition cursor-pointer"
                >
                  Chat baru
                </button>
              </div>
            </div>

            {/* Area Riwayat Pesan */}
            <div className="p-6 space-y-5 min-h-[420px] max-h-[540px] overflow-y-auto">
              <div className="text-center">
                <span className="text-[10px] text-stone-400">Hari ini</span>
              </div>

              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex flex-col items-end gap-1">
                    <div className="bg-[#0F2334] text-white text-xs px-4 py-3 rounded-md max-w-lg leading-relaxed">
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-stone-400">
                      {msg.timestamp} • Terkirim
                    </span>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 max-w-2xl"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#C6A267]/60 text-[#0F2334] flex items-center justify-center font-serif font-bold text-xs shrink-0 mt-0.5">
                      N
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="bg-[#FAF7F2] border border-stone-200/70 rounded-md p-4 space-y-3">
                        <p className="text-xs text-[#0F2334] leading-relaxed whitespace-pre-line">
                          {msg.text}
                        </p>

                        {/* KARTU REKOMENDASI KAMAR */}
                        {msg.recommendedRooms &&
                          msg.recommendedRooms.length > 0 && (
                            <div className="space-y-2.5 pt-1">
                              {msg.recommendedRooms.map((room) => (
                                <div
                                  key={room.id}
                                  className="bg-white border border-stone-200 rounded p-3 flex items-center gap-3.5"
                                >
                                  <img
                                    src={room.imageUrl}
                                    alt={room.name}
                                    className="w-20 h-14 object-cover rounded shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="font-serif text-sm font-bold text-[#0F2334] truncate">
                                        {room.name}
                                      </h4>
                                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded shrink-0">
                                        Sisa {room.remainingRooms} kamar
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-stone-500 truncate">
                                      Rp{room.basePrice.toLocaleString("id-ID")}
                                      /malam • {room.tagline}
                                    </p>
                                    <Link
                                      href={`/kamar/${room.slug}`}
                                      className="inline-block text-[11px] font-semibold text-[#0F2334] hover:underline mt-1"
                                    >
                                      Lihat detail kamar →
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* KARTU RUTE GOOGLE MAPS */}
                        {msg.routeCard && (
                          <div className="bg-white border border-stone-200 rounded p-3.5 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7840]">
                              Panduan Rute ke Hotel
                            </span>
                            <p className="text-[11px] text-stone-600">
                              Dari <strong>{msg.routeCard.origin}</strong> →{" "}
                              <strong>
                                Nestra Hotel (Jl. Mangkubumi No. 28)
                              </strong>
                            </p>
                            <a
                              href={msg.routeCard.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-[#0F2334] hover:bg-[#19354d] text-white text-[11px] font-semibold px-3.5 py-2 rounded transition"
                            >
                              Buka Rute di Google Maps →
                            </a>
                          </div>
                        )}

                        {/* KARTU KONFIRMASI BOOKING */}
                        {msg.createdBooking && (
                          <div className="bg-white border border-emerald-200 rounded p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                                ✓ Reservasi Terkonfirmasi
                              </span>
                              <span className="font-mono text-xs font-bold text-[#0F2334]">
                                {msg.createdBooking.bookingCode}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#0F2334]">
                              {msg.createdBooking.roomName} (
                              {msg.createdBooking.nights} malam)
                            </p>
                            <p className="text-[11px] text-stone-500">
                              {msg.createdBooking.checkIn} s/d{" "}
                              {msg.createdBooking.checkOut} • Total Rp
                              {msg.createdBooking.totalAmount.toLocaleString(
                                "id-ID"
                              )}
                            </p>
                            <Link
                              href="/reservasi/reservasi-saya"
                              className="inline-block bg-[#0F2334] text-white text-[11px] font-semibold px-3.5 py-1.5 rounded"
                            >
                              Lihat di Reservasi saya →
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[9px] text-stone-400">
                        <span>
                          Nia {msg.timestamp ? `• ${msg.timestamp}` : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleHelpful(msg.id)}
                          className={`hover:text-[#0F2334] cursor-pointer ${
                            msg.helpful ? "text-[#0F2334] font-semibold" : ""
                          }`}
                        >
                          {msg.helpful
                            ? "✓ Jawaban membantu"
                            : "Apakah jawaban ini membantu? 👍"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="flex items-center gap-2.5 text-xs text-stone-400">
                  <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#C6A267]/60 text-[#0F2334] flex items-center justify-center font-serif font-bold text-xs">
                    N
                  </div>
                  <span className="bg-[#FAF7F2] border border-stone-200/70 px-3.5 py-2 rounded text-[11px]">
                    Nia sedang mengetik...
                  </span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Area Input & Quick Chips */}
            <div className="p-5 border-t border-stone-100 space-y-3 bg-white">
              <div className="flex flex-wrap gap-2">
                {[
                  "Cek pilihan kamar",
                  "Bantu pesan kamar",
                  "Rute dari Malioboro ke hotel",
                  "Tanya fasilitas",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessage(chip)}
                    disabled={loading}
                    className="border border-stone-200 hover:border-[#0F2334] text-stone-600 hover:text-[#0F2334] text-[11px] px-3 py-1 rounded transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="border border-stone-200 rounded-md p-1.5 flex items-center gap-2 focus-within:border-[#0F2334]"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tulis pesan untuk Nia..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-xs text-[#0F2334] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-[#0F2334] hover:bg-[#19354d] disabled:bg-stone-300 text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Kirim</span>
                  <span>↑</span>
                </button>
              </form>

              <p className="text-[10px] text-stone-400 text-center">
                Nia adalah asisten AI. Untuk kepastian reservasi atau permintaan
                khusus, hubungi resepsionis.
              </p>
            </div>
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
              <p className="text-[11px] text-stone-300">+62 274 582 100</p>
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