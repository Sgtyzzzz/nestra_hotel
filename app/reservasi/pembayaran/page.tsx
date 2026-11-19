"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingCode = searchParams.get("code");

  const [guestInfo, setGuestInfo] = useState({
    firstName: "Aditya",
    lastName: "Pratama",
    email: "aditya.pratama@email.id",
    phone: "812 3456 7890",
    arrivalTime: "14.00–15.00 WIB",
    specialRequest: "Kamar di lantai atas dan jauh dari lift, jika tersedia.",
    roomSlug: "deluks",
    roomName: "Kamar Deluks",
    basePrice: 850000,
    nights: 2,
    adults: 2,
    checkIn: "2026-10-16",
    checkOut: "2026-10-18",
  });

  const [paymentMethod, setPaymentMethod] = useState("BCA Virtual Account");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    title: string;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    // Jika datang dari reservasi Nia (?code=NST-...), muat data booking dari database
    if (existingCode) {
      fetch(`/api/bookings/${encodeURIComponent(existingCode)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((booking) => {
          if (!booking) return;
          setGuestInfo({
            firstName: booking.guestFirstName,
            lastName: booking.guestLastName === "-" ? "" : booking.guestLastName,
            email: booking.guestEmail,
            phone: booking.guestPhone,
            arrivalTime: booking.arrivalTime || "14.00–15.00 WIB",
            specialRequest: booking.specialRequest || "-",
            roomSlug: booking.room.slug,
            roomName: booking.room.name,
            basePrice: booking.room.basePrice,
            nights: booking.nights,
            adults: booking.adults,
            checkIn: new Date(booking.checkIn).toISOString().slice(0, 10),
            checkOut: new Date(booking.checkOut).toISOString().slice(0, 10),
          });
        })
        .catch(() => {});
      return;
    }

    const saved = sessionStorage.getItem("nestra_booking_guest");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGuestInfo((prev) => ({
          ...prev,
          firstName: parsed.firstName || prev.firstName,
          lastName: parsed.lastName || prev.lastName,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          arrivalTime: parsed.arrivalTime || prev.arrivalTime,
          specialRequest: parsed.specialRequest || prev.specialRequest,
          roomSlug: parsed.roomSlug || prev.roomSlug,
          roomName: parsed.roomName || prev.roomName,
          basePrice: parsed.basePrice || prev.basePrice,
          nights: parsed.nights || prev.nights,
          adults: parsed.adults || prev.adults,
          checkIn: parsed.checkIn || prev.checkIn,
          checkOut: parsed.checkOut || prev.checkOut,
        }));
      } catch {
        // Gunakan default
      }
    }
  }, [existingCode]);

  const roomSubtotal = guestInfo.basePrice * guestInfo.nights;
  const discountAmount = appliedPromo
    ? Math.round((roomSubtotal * appliedPromo.discountPercent) / 100)
    : 0;
  const afterDiscount = roomSubtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * 0.11);
  const totalAmount = afterDiscount + taxAmount;

  const formatRupiah = (amount: number) =>
    "Rp" + amount.toLocaleString("id-ID");

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");

    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          nights: guestInfo.nights,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAppliedPromo(null);
        setPromoError(data.error || "Kode promo tidak valid.");
      } else {
        setAppliedPromo({
          code: data.code,
          discountPercent: data.discountPercent,
          title: data.title,
        });
      }
    } catch {
      setPromoError("Gagal memvalidasi kode promo.");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Jika melunasi booking yang sudah dibuat via Nia
      if (existingCode) {
        const res = await fetch(
          `/api/bookings/${encodeURIComponent(existingCode)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "PAY",
              paymentMethod,
              promoCode: appliedPromo?.code || null,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error || "Gagal memproses pembayaran.");
          setIsSubmitting(false);
          return;
        }

        sessionStorage.setItem("nestra_last_booking_code", data.bookingCode);
        router.push(`/reservasi/konfirmasi?code=${data.bookingCode}`);
        return;
      }

      // Alur checkout manual
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: guestInfo.roomSlug,
          guestFirstName: guestInfo.firstName,
          guestLastName: guestInfo.lastName,
          guestEmail: guestInfo.email,
          guestPhone: `+62 ${guestInfo.phone}`,
          arrivalTime: guestInfo.arrivalTime,
          specialRequest: guestInfo.specialRequest,
          checkIn: guestInfo.checkIn,
          checkOut: guestInfo.checkOut,
          nights: guestInfo.nights,
          adults: guestInfo.adults,
          promoCode: appliedPromo?.code || null,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(
          data.error || "Terjadi kesalahan saat memproses reservasi."
        );
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem("nestra_last_booking_code", data.bookingCode);
      router.push(`/reservasi/konfirmasi?code=${data.bookingCode}`);
    } catch {
      setSubmitError("Tidak dapat terhubung ke server. Pastikan server berjalan.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-[#1A202C]">
      {/* NAVBAR */}
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
          <span className="text-xs text-stone-500">
            {existingCode
              ? `Pembayaran Reservasi • ${existingCode}`
              : "Langkah 3 dari 4 • Pembayaran Aman"}
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        {/* LEFT: PAYMENT METHODS & PROMO */}
        <div className="lg:col-span-7 space-y-6">
          {/* Promo Card */}
          <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-lg text-[#0F2334]">
              Kode promo atau penawaran
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Masukkan kode (cth: AWAL15 atau NESTRALAMA)"
                className="flex-1 border border-stone-200 rounded px-3.5 py-2.5 text-xs uppercase focus:outline-none focus:border-[#0F2334]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={isApplyingPromo}
                className="border border-[#0F2334] text-[#0F2334] hover:bg-stone-50 px-4 py-2.5 rounded text-xs font-semibold transition cursor-pointer"
              >
                {isApplyingPromo ? "Mengecek..." : "Terapkan"}
              </button>
            </div>
            {promoError && (
              <p className="text-[11px] text-red-600">{promoError}</p>
            )}
            {appliedPromo && (
              <p className="text-[11px] text-emerald-700 font-medium">
                ✓ Promo {appliedPromo.code} diterapkan ({appliedPromo.title} —
                Diskon {appliedPromo.discountPercent}%)
              </p>
            )}
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-6 rounded-md border border-stone-200/90 space-y-4">
            <h2 className="font-serif text-lg text-[#0F2334]">
              Pilih metode pembayaran
            </h2>

            <div className="space-y-2.5">
              {[
                {
                  id: "BCA Virtual Account",
                  desc: "Verifikasi otomatis instan • Tanpa biaya admin",
                },
                {
                  id: "Mandiri Virtual Account",
                  desc: "Transfer melalui Livin' by Mandiri atau ATM",
                },
                {
                  id: "QRIS",
                  desc: "Bayar cepat via GoPay, OVO, Dana, ShopeePay, atau Mobile Banking",
                },
                {
                  id: "Kartu Kredit / Debit",
                  desc: "Visa, Mastercard, JCB dengan proteksi 3D Secure",
                },
              ].map((method) => (
                <label
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-start gap-3 p-4 rounded border cursor-pointer transition ${
                    paymentMethod === method.id
                      ? "border-[#0F2334] bg-[#F8F6F2]"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="mt-1 accent-[#0F2334]"
                  />
                  <div>
                    <span className="block text-xs font-bold text-[#0F2334]">
                      {method.id}
                    </span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">
                      {method.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded">
                {submitError}
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="w-full bg-[#0F2334] hover:bg-[#19354d] disabled:bg-stone-400 text-white py-3.5 rounded text-xs font-semibold transition cursor-pointer"
            >
              {isSubmitting
                ? "Memproses pembayaran..."
                : `Bayar sekarang • ${formatRupiah(totalAmount)}`}
            </button>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <aside className="lg:col-span-5 bg-white p-6 rounded-md border border-stone-200/90 space-y-5">
          <h2 className="font-serif text-lg text-[#0F2334] pb-3 border-b border-stone-100">
            Ringkasan pesanan
          </h2>

          <div className="space-y-1 text-xs">
            <p className="font-bold text-[#0F2334]">{guestInfo.roomName}</p>
            <p className="text-stone-500">
              {guestInfo.checkIn} s/d {guestInfo.checkOut} ({guestInfo.nights}{" "}
              malam • {guestInfo.adults} dewasa)
            </p>
            <p className="text-stone-500 pt-1">
              Tamu: {guestInfo.firstName} {guestInfo.lastName}
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>
                {formatRupiah(guestInfo.basePrice)} × {guestInfo.nights} malam
              </span>
              <span>{formatRupiah(roomSubtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Diskon promo ({appliedPromo?.code})</span>
                <span>-{formatRupiah(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>Pajak & layanan (11%)</span>
              <span>{formatRupiah(taxAmount)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
            <span className="text-xs font-bold text-[#0F2334]">
              Total pembayaran
            </span>
            <span className="font-serif text-xl font-bold text-[#0F2334]">
              {formatRupiah(totalAmount)}
            </span>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs">Memuat pembayaran...</div>}>
      <PaymentContent />
    </Suspense>
  );
}