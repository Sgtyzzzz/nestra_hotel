"use client";

import React, { useEffect, useState } from "react";

interface BookingItem {
  id: string;
  bookingCode: string;
  guestFirstName: string;
  guestLastName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  specialRequest?: string | null;
  room: { name: string };
}

interface RoomUnit {
  roomNumber: string;
  status: string;
}

interface RoomType {
  id: string;
  name: string;
}

export default function StaffFrontDeskPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [readyUnits, setReadyUnits] = useState<RoomUnit[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "COMPLETED">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Form Walk-in
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [checkIn, setCheckIn] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [checkOut, setCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [specialRequest, setSpecialRequest] = useState("");
  const [savingWalkin, setSavingWalkin] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/operations");
      if (res.ok) {
        const json = await res.json();
        setBookings(json.bookings || []);
        const ready = (json.roomUnits || []).filter(
          (u: RoomUnit) => u.status === "READY"
        );
        setReadyUnits(ready);
        setRoomTypes(json.roomTypes || []);
        if (json.roomTypes?.length > 0 && !selectedRoomId) {
          setSelectedRoomId(json.roomTypes[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    await fetch("/api/staff/operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_BOOKING", bookingId, status }),
    });
    loadData();
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWalkin(true);
    try {
      const res = await fetch("/api/staff/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_WALKIN",
          guestName,
          guestPhone,
          roomId: selectedRoomId,
          roomNumber: selectedUnit,
          checkIn,
          checkOut,
          specialRequest,
        }),
      });
      if (res.ok) {
        setGuestName("");
        setGuestPhone("");
        setSelectedUnit("");
        setSpecialRequest("");
        loadData();
      }
    } finally {
      setSavingWalkin(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchFilter = filter === "ALL" || b.status === filter;
    const fullName = `${b.guestFirstName} ${b.guestLastName}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2334]">
            Front desk
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Layanan lobi, kedatangan, dan keberangkatan tamu.
          </p>
        </div>
        <span className="text-[10px] tracking-widest uppercase text-[#B8893E] font-semibold">
          01 / LAYANAN LOBI
        </span>
      </div>

      {/* DAFTAR TAMU HARI INI */}
      <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-bold">Daftar tamu hari ini</h2>
          <input
            type="text"
            placeholder="Cari nama / kode booking"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-stone-200 rounded px-3 py-1.5 text-xs w-full sm:w-64 focus:outline-none focus:border-[#0F2334]"
          />
        </div>

        {/* FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded font-semibold cursor-pointer ${
              filter === "ALL"
                ? "bg-[#0F2334] text-white"
                : "border border-stone-200 text-stone-600"
            }`}
          >
            Semua ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("UPCOMING")}
            className={`px-3 py-1.5 rounded font-semibold cursor-pointer ${
              filter === "UPCOMING"
                ? "bg-[#0F2334] text-white"
                : "border border-stone-200 text-stone-600"
            }`}
          >
            Aktif / Check-in (
            {bookings.filter((b) => b.status === "UPCOMING").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded font-semibold cursor-pointer ${
              filter === "COMPLETED"
                ? "bg-[#0F2334] text-white"
                : "border border-stone-200 text-stone-600"
            }`}
          >
            Selesai ({bookings.filter((b) => b.status === "COMPLETED").length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-stone-500 text-[11px] border-y border-stone-200">
                <th className="py-3 px-3">Kode booking</th>
                <th className="py-3 px-3">Nama tamu</th>
                <th className="py-3 px-3">Tipe / kamar</th>
                <th className="py-3 px-3">Jadwal menginap</th>
                <th className="py-3 px-3">Permintaan khusus</th>
                <th className="py-3 px-3 text-right">Aksi cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Memuat daftar tamu...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Tidak ada data reservasi yang cocok.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-3 font-mono font-semibold">
                      {b.bookingCode}
                    </td>
                    <td className="py-3.5 px-3 font-medium">
                      {b.guestFirstName} {b.guestLastName}
                    </td>
                    <td className="py-3.5 px-3 text-stone-600">
                      {b.room?.name}
                    </td>
                    <td className="py-3.5 px-3 text-stone-600">
                      {new Date(b.checkIn).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      –{" "}
                      {new Date(b.checkOut).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-stone-500">
                      {b.specialRequest || "-"}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {b.status === "UPCOMING" ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(b.id, "COMPLETED")
                            }
                            className="bg-[#0F2334] hover:bg-[#19354d] text-white px-3 py-1.5 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Check-out
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(b.id, "CANCELLED")
                            }
                            className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-[11px] font-medium cursor-pointer"
                          >
                            Batalkan
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-[11px] font-semibold ${
                            b.status === "COMPLETED"
                              ? "text-emerald-700"
                              : "text-red-600"
                          }`}
                        >
                          {b.status === "COMPLETED" ? "✓ Selesai" : "Dibatalkan"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM RESERVASI WALK-IN */}
      <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold">Reservasi walk-in</h2>
            <p className="text-xs text-stone-500">
              Catat tamu yang datang langsung ke lobi tanpa pemesanan website.
            </p>
          </div>
          <span className="text-[11px] text-[#B8893E] font-medium">
            Tamu langsung
          </span>
        </div>

        <form onSubmit={handleCreateWalkin} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Nama lengkap tamu *
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama sesuai identitas"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Nomor telepon *
              </label>
              <input
                type="text"
                required
                placeholder="08xx xxxx xxxx"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Tipe kamar *
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full border border-stone-200 rounded px-2.5 py-2.5 bg-white"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Unit siap huni
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full border border-stone-200 rounded px-2.5 py-2.5 bg-white"
                >
                  <option value="">Pilih unit</option>
                  {readyUnits.map((u) => (
                    <option key={u.roomNumber} value={u.roomNumber}>
                      #{u.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Tanggal check-in *
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Tanggal check-out *
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Permintaan khusus
              </label>
              <input
                type="text"
                placeholder="Contoh: tambahan bantal"
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-stone-400">
              Hanya unit berstatus Siap Huni yang dapat dipilih.
            </span>
            <button
              type="submit"
              disabled={savingWalkin}
              className="bg-[#0F2334] hover:bg-[#19354d] text-white font-semibold px-5 py-2.5 rounded cursor-pointer"
            >
              {savingWalkin ? "Menyimpan..." : "Simpan reservasi walk-in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}