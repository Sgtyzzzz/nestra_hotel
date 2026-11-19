"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type BookingStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";

interface BookingRecord {
  id: string;
  bookingCode: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  paymentMethod: string | null;
  room: {
    slug: string;
    name: string;
    images: string[];
  };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | BookingStatus>("ALL");
  const [cancellingCode, setCancellingCode] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("aditya.pratama@email.id");

  const fetchBookings = async (targetEmail?: string) => {
    setLoading(true);
    try {
      let email: string = targetEmail || "";
      if (!email) {
        const savedGuest = sessionStorage.getItem("nestra_booking_guest");
        email = "aditya.pratama@email.id";
        if (savedGuest) {
          const parsed = JSON.parse(savedGuest);
          if (parsed.email) email = String(parsed.email);
        }
      }

      setSearchEmail(email);

      const res = await fetch(
        `/api/bookings?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch {
      // Abaikan jika gagal fetch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEmailSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchEmail.trim().toLowerCase();
    if (!clean) return;
    sessionStorage.setItem(
      "nestra_booking_guest",
      JSON.stringify({ email: clean })
    );
    fetchBookings(clean);
  };

  const handleCancelBooking = async (bookingCode: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan reservasi ${bookingCode}?`
    );
    if (!confirmed) return;

    setCancellingCode(bookingCode);
    try {
      const res = await fetch(`/api/bookings/${bookingCode}`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchBookings(searchEmail);
      }
    } finally {
      setCancellingCode(null);
    }
  };

  const filteredBookings = bookings.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.status === activeTab;
  });

  const counts = {
    ALL: bookings.length,
    UPCOMING: bookings.filter((b) => b.status === "UPCOMING").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  const formatRupiah = (amount: number) =>
    "Rp" + amount.toLocaleString("id-ID");

  const formatDateRange = (checkInIso: string, checkOutIso: string) => {
    const start = new Date(checkInIso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    const end = new Date(checkOutIso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${start} – ${end}`;
  };

  const getStatusInfo = (booking: BookingRecord) => {
    if (booking.status === "CANCELLED") {
      return {
        label: "Dibatalkan",
        style: "bg-red-50 text-red-700 border-red-200",
      };
    }
    if (booking.paymentStatus !== "PAID") {
      return {
        label: "Menunggu pembayaran",
        style: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    if (booking.status === "COMPLETED") {
      return {
        label: "Selesai",
        style: "bg-stone-100 text-stone-700 border-stone-200",
      };
    }
    return {
      label: "Akan datang",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  const guestName = bookings[0]
    ? `${bookings[0].guestFirstName} ${
        bookings[0].guestLastName === "-" ? "" : bookings[0].guestLastName
      }`.trim()
    : "Tamu Nestra";
  const guestEmail = bookings[0]?.guestEmail || searchEmail;
  const firstName = bookings[0]?.guestFirstName || "Tamu";

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
            <Link href="/bantuan" className="hover:text-[#0F2334] transition">
              Hubungi kami
            </Link>
          </nav>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/reservasi/reservasi-saya"
              className="hidden sm:inline text-[#0F2334] font-semibold"
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

      {/* MAIN CONTENT */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#0F2334]">
            Reservasi saya
          </h1>
          <p className="text-xs text-stone-500 mt-1.5">
            Halo, {firstName}. Rencana menginap dan kenangan perjalanan Anda ada
            di sini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="bg-white p-5 rounded-md border border-stone-200/90 space-y-5">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#0F2334] text-white flex items-center justify-center text-xs font-bold">
                  {guestName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0F2334]">
                    {guestName}
                  </h2>
                  <p className="text-[11px] text-stone-400 break-all">
                    {guestEmail}
                  </p>
                </div>
              </div>

              {/* FORM GANTI / CARI EMAIL RESERVASI */}
              <form
                onSubmit={handleEmailSearch}
                className="pt-4 border-t border-stone-100 space-y-2"
              >
                <label className="block text-[11px] font-semibold text-[#0F2334]">
                  Cek reservasi via email
                </label>
                <input
                  type="email"
                  required
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Masukkan email pemesan"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:outline-none focus:border-[#0F2334]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#0F2334] hover:bg-[#19354d] text-white py-2 rounded text-xs font-medium transition cursor-pointer"
                >
                  Tampilkan reservasi
                </button>
              </form>

              <nav className="pt-4 border-t border-stone-100 space-y-2.5 text-xs">
                <Link
                  href="/reservasi/reservasi-saya"
                  className="block font-bold text-[#0F2334]"
                >
                  Reservasi saya
                </Link>
                <Link
                  href="/bantuan"
                  className="block text-stone-500 hover:text-[#0F2334]"
                >
                  Bantuan &amp; perubahan jadwal
                </Link>
              </nav>
            </div>

            <Link
              href="/bantuan"
              className="block bg-white hover:border-[#0F2334] p-5 rounded-md border border-stone-200/90 space-y-1.5 transition group"
            >
              <h3 className="font-serif text-base text-[#0F2334] group-hover:underline">
                Butuh bantuan?
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Kami siap membantu rencana Anda.
              </p>
              <p className="text-xs font-bold text-[#0F2334] pt-1">
                +62 274 582 100
              </p>
              <span className="inline-block text-[11px] font-semibold text-[#B8893E] pt-1">
                Kirim pesan / aduan →
              </span>
            </Link>
          </aside>

          {/* RIGHT CONTENT */}
          <section className="lg:col-span-9 space-y-5">
            <div className="flex flex-wrap items-center gap-6 border-b border-stone-200 pb-3 text-xs">
              {[
                { key: "ALL", label: `Semua (${counts.ALL})` },
                { key: "UPCOMING", label: `Akan datang (${counts.UPCOMING})` },
                { key: "COMPLETED", label: `Selesai (${counts.COMPLETED})` },
                { key: "CANCELLED", label: `Dibatalkan (${counts.CANCELLED})` },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.key as "ALL" | BookingStatus)
                    }
                    className={`pb-3 -mb-[13px] transition cursor-pointer ${
                      isActive
                        ? "border-b-2 border-[#0F2334] font-bold text-[#0F2334]"
                        : "text-stone-500 hover:text-[#0F2334]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="bg-white p-8 rounded-md border border-stone-200 text-xs text-stone-500">
                Memuat daftar reservasi dari database...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white p-8 rounded-md border border-stone-200 text-center space-y-3">
                <p className="text-xs text-stone-500">
                  Belum ada reservasi untuk email <strong>{searchEmail}</strong>.
                </p>
                <Link
                  href="/kamar"
                  className="inline-block bg-[#0F2334] text-white px-4 py-2 rounded text-xs font-medium"
                >
                  Cari kamar sekarang
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const statusInfo = getStatusInfo(booking);
                  const isUnpaid =
                    booking.status === "UPCOMING" &&
                    booking.paymentStatus !== "PAID";

                  return (
                    <div
                      key={booking.id}
                      className="bg-white p-5 rounded-md border border-stone-200/90 space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <span className="text-[11px] font-bold tracking-wider text-[#0F2334]">
                          {booking.bookingCode}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2.5 py-0.5 rounded border ${statusInfo.style}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row gap-5 items-stretch">
                        <div className="md:w-48 h-32 rounded overflow-hidden bg-stone-200 shrink-0">
                          <img
                            src={
                              booking.room.images?.[0] ||
                              "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
                            }
                            alt={booking.room.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="font-serif text-xl text-[#0F2334]">
                              Nestra Hotel Yogyakarta
                            </h3>
                            <p className="text-xs font-medium text-stone-700 mt-1">
                              {formatDateRange(
                                booking.checkIn,
                                booking.checkOut
                              )}{" "}
                              - {booking.nights} malam
                            </p>
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              {booking.room.name} • {booking.adults} dewasa • 1
                              kamar
                            </p>
                          </div>

                          <p
                            className={`text-[11px] mt-3 font-medium ${
                              booking.status === "CANCELLED"
                                ? "text-stone-400"
                                : isUnpaid
                                ? "text-amber-700"
                                : "text-emerald-700"
                            }`}
                          >
                            {booking.status === "CANCELLED"
                              ? "Reservasi dibatalkan"
                              : isUnpaid
                              ? "Belum dibayar • Selesaikan pembayaran untuk konfirmasi"
                              : `Lunas • ${
                                  booking.paymentMethod || "BCA Virtual Account"
                                }`}
                          </p>
                        </div>

                        <div className="md:w-44 flex flex-col justify-between md:items-end md:text-right">
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold">
                              {booking.status === "CANCELLED"
                                ? "TOTAL DIKEMBALIKAN"
                                : "TOTAL RESERVASI"}
                            </span>
                            <span className="font-serif text-lg font-bold text-[#0F2334] mt-0.5 block">
                              {formatRupiah(booking.totalAmount)}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col md:items-end gap-2 w-full md:w-auto">
                            {booking.status === "UPCOMING" && (
                              <>
                                {isUnpaid ? (
                                  <Link
                                    href={`/reservasi/pembayaran?code=${booking.bookingCode}`}
                                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-xs font-medium transition text-center"
                                  >
                                    Bayar sekarang
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/reservasi/konfirmasi?code=${booking.bookingCode}`}
                                    className="bg-[#0F2334] hover:bg-[#19354d] text-white px-4 py-2 rounded text-xs font-medium transition text-center"
                                  >
                                    Lihat bukti
                                  </Link>
                                )}
                                <button
                                  type="button"
                                  disabled={
                                    cancellingCode === booking.bookingCode
                                  }
                                  onClick={() =>
                                    handleCancelBooking(booking.bookingCode)
                                  }
                                  className="text-[11px] text-red-600 hover:underline cursor-pointer"
                                >
                                  {cancellingCode === booking.bookingCode
                                    ? "Membatalkan..."
                                    : "Batalkan reservasi"}
                                </button>
                              </>
                            )}

                            {booking.status !== "UPCOMING" && (
                              <Link
                                href={`/reservasi/konfirmasi?code=${booking.bookingCode}`}
                                className="border border-stone-300 bg-white hover:bg-stone-50 text-[#0F2334] px-4 py-2 rounded text-xs font-medium transition text-center"
                              >
                                Lihat detail
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}