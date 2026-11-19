"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface RoomUnit {
  roomNumber: string;
  floor: number;
  typeName: string;
  bedType: string;
  status: "OCCUPIED" | "READY" | "DIRTY" | "MAINTENANCE";
  currentGuest: {
    bookingCode: string;
    guestName: string;
    dates: string;
    adults: number;
    arrivalTime: string;
    isArrivingToday: boolean;
  } | null;
}

interface HousekeepingTask {
  id: string;
  roomNumber: string;
  task: string;
  staff: string;
  priority: "Tinggi" | "Sedang";
  deadline: string;
  status: "Menunggu" | "Dibersihkan" | "Perawatan" | "Selesai";
}

const INITIAL_TASKS: HousekeepingTask[] = [
  {
    id: "t1",
    roomNumber: "202",
    task: "Persiapan kedatangan",
    staff: "Siti Aminah",
    priority: "Tinggi",
    deadline: "12.30",
    status: "Menunggu",
  },
  {
    id: "t2",
    roomNumber: "204",
    task: "Bersihkan & isi perlengkapan",
    staff: "Lina Kartika",
    priority: "Tinggi",
    deadline: "13.00",
    status: "Dibersihkan",
  },
  {
    id: "t3",
    roomNumber: "302",
    task: "Persiapan kedatangan",
    staff: "Rina Pertiwi",
    priority: "Sedang",
    deadline: "13.00",
    status: "Menunggu",
  },
  {
    id: "t4",
    roomNumber: "307",
    task: "Bersihkan kamar Deluks",
    staff: "Deni Prakoso",
    priority: "Sedang",
    deadline: "13.30",
    status: "Dibersihkan",
  },
  {
    id: "t5",
    roomNumber: "312",
    task: "Periksa pendingin ruangan",
    staff: "Arif Setiawan",
    priority: "Tinggi",
    deadline: "11.00",
    status: "Perawatan",
  },
];

export default function AdminRoomsPage() {
  const [units, setUnits] = useState<RoomUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & View States
  const [selectedFloor, setSelectedFloor] = useState<number>(3);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>("301");

  // Housekeeping Tasks & Modals
  const [tasks, setTasks] = useState<HousekeepingTask[]>(INITIAL_TASKS);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    roomNumber: "301",
    task: "Persiapan kedatangan",
    staff: "Siti Aminah",
    priority: "Tinggi" as "Tinggi" | "Sedang",
    deadline: "13.30",
  });

  // Ambil data langsung dari tabel RoomUnit & Booking yang sama dengan /staff/kamar
  const fetchSyncedRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/staff/operations", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      const rawUnits = data.roomUnits || [];
      const bookings = data.bookings || [];

      const mapped: RoomUnit[] = rawUnits.map(
        (u: {
          roomNumber: string;
          floor: number;
          category?: string;
          status: RoomUnit["status"];
        }) => {
          const num = parseInt(u.roomNumber, 10);
          let typeName = "Superior";
          let bedType = "1 Ranjang Queen";

          if (u.floor === 2) {
            typeName = num % 2 === 0 ? "Deluks" : "Superior";
            bedType =
              typeName === "Deluks" ? "1 Ranjang King" : "1 Ranjang Queen";
          } else if (u.floor === 3) {
            typeName = "Deluks";
            bedType = "1 Ranjang King";
          }

          // Cocokkan tamu aktif dari database Booking
          const matchedBooking = bookings.find(
            (b: {
              status: string;
              specialRequest?: string | null;
            }) =>
              (b.status === "UPCOMING" || b.status === "CHECKED_IN") &&
              b.specialRequest?.includes(`#${u.roomNumber}`)
          );

          let currentGuest: RoomUnit["currentGuest"] = null;
          if (matchedBooking) {
            const dIn = new Date(matchedBooking.checkIn);
            const dOut = new Date(matchedBooking.checkOut);
            const todayStr = new Date().toDateString();

            currentGuest = {
              bookingCode: matchedBooking.bookingCode,
              guestName:
                `${matchedBooking.guestFirstName} ${matchedBooking.guestLastName}`.trim(),
              dates: `${dIn.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })} – ${dOut.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}`,
              adults: 2,
              arrivalTime: "14.00 WIB",
              isArrivingToday: dIn.toDateString() === todayStr,
            };
          }

          return {
            roomNumber: u.roomNumber,
            floor: u.floor,
            typeName,
            bedType,
            status: u.status,
            currentGuest,
          };
        }
      );

      setUnits(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyncedRooms();
  }, [fetchSyncedRooms]);

  // KPI Keseluruhan 60 Kamar (Sinkron dengan /staff/kamar)
  const totalRooms = units.length || 60;
  const occupiedCount = units.filter((u) => u.status === "OCCUPIED").length;
  const readyCount = units.filter((u) => u.status === "READY").length;
  const dirtyCount = units.filter((u) => u.status === "DIRTY").length;
  const maintenanceCount = units.filter(
    (u) => u.status === "MAINTENANCE"
  ).length;

  // Filter Lantai & Kriteria
  const floorUnits = units.filter((u) => {
    if (viewMode === "GRID" && u.floor !== selectedFloor) return false;
    if (typeFilter !== "ALL" && u.typeName !== typeFilter) return false;
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoom = u.roomNumber.toLowerCase().includes(q);
      const matchGuest =
        u.currentGuest?.guestName.toLowerCase().includes(q) || false;
      if (!matchRoom && !matchGuest) return false;
    }
    return true;
  });

  const activeUnit =
    units.find((u) => u.roomNumber === selectedRoomNumber) ||
    floorUnits[0] ||
    units[0];

  // Simpan perubahan status langsung ke database PostgreSQL agar /staff/kamar ikut berubah
  const handleChangeRoomStatus = async (newStatus: RoomUnit["status"]) => {
    if (!activeUnit) return;

    setUnits((prev) =>
      prev.map((u) =>
        u.roomNumber === activeUnit.roomNumber ? { ...u, status: newStatus } : u
      )
    );
    setIsStatusModalOpen(false);

    await fetch("/api/staff/operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_ROOM_UNIT",
        roomNumber: activeUnit.roomNumber,
        status: newStatus,
      }),
    });
  };

  const handleAdvanceTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus =
          t.status === "Menunggu"
            ? "Dibersihkan"
            : t.status === "Dibersihkan"
            ? "Selesai"
            : "Selesai";
        return { ...t, status: nextStatus };
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    setTasks((prev) => [
      {
        id: `t-${Date.now()}`,
        roomNumber: newTask.roomNumber,
        task: newTask.task,
        staff: newTask.staff,
        priority: newTask.priority,
        deadline: newTask.deadline,
        status: "Menunggu",
      },
      ...prev,
    ]);
    setIsTaskModalOpen(false);
  };

  const renderStatusPill = (status: RoomUnit["status"]) => {
    switch (status) {
      case "OCCUPIED":
        return (
          <span className="inline-block bg-[#EEF2F6] text-[#0F2334] text-[10px] font-semibold px-2 py-0.5 rounded">
            Terisi
          </span>
        );
      case "READY":
        return (
          <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded">
            Siap
          </span>
        );
      case "DIRTY":
        return (
          <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded">
            Dibersihkan
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="inline-block bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded">
            Perawatan
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#0F2334]">
            Kamar &amp; kebersihan
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Kesiapan kamar, penempatan tamu, dan tugas tim tata graha (sinkron
            dengan portal karyawan).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              setViewMode((prev) => (prev === "GRID" ? "LIST" : "GRID"))
            }
            className="bg-white border border-stone-200 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
          >
            {viewMode === "GRID" ? "Daftar kamar" : "Tampilan denah"}
          </button>
          <button
            type="button"
            onClick={() => {
              setNewTask((prev) => ({
                ...prev,
                roomNumber: activeUnit?.roomNumber || "301",
              }));
              setIsTaskModalOpen(true);
            }}
            className="bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
          >
            Buat tugas +
          </button>
        </div>
      </div>

      {/* 4 KARTU KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Total kamar</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : totalRooms}
          </p>
          <p className="text-[10px] text-stone-400">
            3 lantai • 20 kamar per lantai
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Tamu menginap</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : occupiedCount}
          </p>
          <p className="text-[10px] text-stone-400">
            Terhubung langsung dengan reservasi
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Siap ditempati</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : readyCount}
          </p>
          <p className="text-[10px] text-stone-400">Bersih dan telah diperiksa</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">
            Perlu disiapkan / perawatan
          </p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : `${dirtyCount} / ${maintenanceCount}`}
          </p>
          <p className="text-[10px] text-stone-400">
            {dirtyCount} dibersihkan • {maintenanceCount} perawatan
          </p>
        </div>
      </div>

      {/* BARIS FILTER */}
      <div className="bg-white border border-stone-200/90 rounded-md p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[10px] font-semibold text-stone-500">
            Lantai
          </label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(Number(e.target.value))}
            className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
          >
            <option value={1}>Lantai 1</option>
            <option value={2}>Lantai 2</option>
            <option value={3}>Lantai 3</option>
          </select>
        </div>

        <div className="md:col-span-3 space-y-1">
          <label className="block text-[10px] font-semibold text-stone-500">
            Jenis kamar
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
          >
            <option value="ALL">Semua jenis</option>
            <option value="Superior">Superior</option>
            <option value="Deluks">Deluks</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="block text-[10px] font-semibold text-stone-500">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
          >
            <option value="ALL">Semua status</option>
            <option value="OCCUPIED">Terisi</option>
            <option value="READY">Siap</option>
            <option value="DIRTY">Dibersihkan</option>
            <option value="MAINTENANCE">Perawatan</option>
          </select>
        </div>

        <div className="md:col-span-3 space-y-1">
          <label className="block text-[10px] font-semibold text-stone-500">
            Cari kamar / tamu
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nomor kamar atau nama tamu"
            className="w-full border border-stone-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#0F2334]"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() =>
              setViewMode((prev) => (prev === "GRID" ? "LIST" : "GRID"))
            }
            className="w-full border border-stone-200 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold py-2 rounded transition cursor-pointer"
          >
            {viewMode === "GRID" ? "Tampilan daftar" : "Tampilan denah"}
          </button>
        </div>
      </div>

      {/* GRID DENAH KAMAR (KIRI) + PANEL DETAIL KAMAR (KANAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* KIRI: DENAH LANTAI ATAU TABEL DAFTAR */}
        <div className="lg:col-span-8 bg-white border border-stone-200/90 rounded-md p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-lg text-[#0F2334]">
              {viewMode === "GRID"
                ? `Lantai ${selectedFloor} • 20 kamar`
                : `Semua kamar (${floorUnits.length})`}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="bg-[#EEF2F6] text-[#0F2334] font-semibold px-2.5 py-0.5 rounded">
                Terisi{" "}
                {floorUnits.filter((u) => u.status === "OCCUPIED").length}
              </span>
              <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded">
                Siap {floorUnits.filter((u) => u.status === "READY").length}
              </span>
              <span className="bg-amber-50 text-amber-700 font-semibold px-2.5 py-0.5 rounded">
                Kotor {floorUnits.filter((u) => u.status === "DIRTY").length}
              </span>
              <span className="bg-red-50 text-red-700 font-semibold px-2.5 py-0.5 rounded">
                Perawatan{" "}
                {floorUnits.filter((u) => u.status === "MAINTENANCE").length}
              </span>
              <span className="text-stone-400">D = Deluks • S = Superior</span>
            </div>
          </div>

          {loading ? (
            <p className="py-12 text-center text-xs text-stone-400">
              Memuat denah kamar...
            </p>
          ) : viewMode === "GRID" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {floorUnits.map((unit) => {
                const isSelected = activeUnit?.roomNumber === unit.roomNumber;
                return (
                  <button
                    key={unit.roomNumber}
                    type="button"
                    onClick={() => setSelectedRoomNumber(unit.roomNumber)}
                    className={`text-left rounded-md p-3 transition cursor-pointer space-y-1.5 border ${
                      isSelected
                        ? "border-2 border-[#0F2334] bg-[#FAF7F2]/60 shadow-xs"
                        : "border-stone-200 hover:border-stone-400 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base font-bold text-[#0F2334]">
                        {unit.roomNumber}
                      </span>
                      <span className="text-[9px] text-stone-400 font-semibold">
                        {unit.typeName.charAt(0)}
                      </span>
                    </div>

                    <div>{renderStatusPill(unit.status)}</div>

                    <p className="text-[10px] text-stone-400 truncate">
                      {unit.currentGuest
                        ? `${unit.currentGuest.guestName.split(" ")[0]} • ${
                            unit.currentGuest.isArrivingToday
                              ? "tiba hari ini"
                              : "menginap"
                          }`
                        : unit.status === "OCCUPIED"
                        ? "Tamu menginap"
                        : unit.status === "MAINTENANCE"
                        ? "Pemeriksaan teknis"
                        : unit.status === "DIRTY"
                        ? "Perlu dibersihkan"
                        : "Bersih & diperiksa"}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[10px] text-stone-500 uppercase">
                    <th className="py-2 px-3">Kamar</th>
                    <th className="py-2 px-3">Tipe</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Tamu</th>
                    <th className="py-2 px-3 text-right">Pilih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {floorUnits.map((u) => (
                    <tr key={u.roomNumber} className="hover:bg-[#FAF7F2]/50">
                      <td className="py-2.5 px-3 font-bold text-[#0F2334]">
                        {u.roomNumber}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {u.typeName}
                      </td>
                      <td className="py-2.5 px-3">
                        {renderStatusPill(u.status)}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {u.currentGuest ? u.currentGuest.guestName : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRoomNumber(u.roomNumber)}
                          className="text-xs font-semibold text-[#0F2334] hover:underline cursor-pointer"
                        >
                          Lihat →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* KANAN: DETAIL KAMAR TERPILIH */}
        {activeUnit && (
          <aside className="lg:col-span-4 bg-white border border-stone-200/90 rounded-md p-6 space-y-5">
            <div className="space-y-2">
              <h3 className="font-serif text-lg text-[#0F2334]">
                Kamar {activeUnit.roomNumber} • {activeUnit.typeName}
              </h3>

              <div>
                {activeUnit.status === "READY" ? (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                    Siap ditempati
                  </span>
                ) : activeUnit.status === "OCCUPIED" ? (
                  <span className="bg-[#EEF2F6] text-[#0F2334] text-[10px] font-semibold px-2.5 py-0.5 rounded">
                    Sedang ditempati
                  </span>
                ) : activeUnit.status === "DIRTY" ? (
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                    Perlu dibersihkan
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                    Dalam perawatan teknis
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs border-y border-stone-100 py-3">
              <div className="flex justify-between">
                <span className="text-stone-400">Lantai</span>
                <span className="font-medium text-[#0F2334]">
                  {activeUnit.floor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Ranjang</span>
                <span className="font-medium text-[#0F2334]">
                  {activeUnit.bedType}
                </span>
              </div>
            </div>

            {activeUnit.currentGuest ? (
              <div className="space-y-1.5">
                <span className="block text-[10px] text-stone-400 uppercase tracking-wider">
                  {activeUnit.currentGuest.isArrivingToday
                    ? "Kedatangan berikutnya"
                    : "Tamu saat ini"}
                </span>
                <p className="font-serif text-base font-bold text-[#0F2334]">
                  {activeUnit.currentGuest.guestName}
                </p>
                <p className="text-[11px] text-stone-500">
                  {activeUnit.currentGuest.bookingCode} •{" "}
                  {activeUnit.currentGuest.dates} •{" "}
                  {activeUnit.currentGuest.adults} dewasa
                </p>
                <p className="text-[11px] text-stone-400">
                  Perkiraan tiba {activeUnit.currentGuest.arrivalTime}
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-xs text-stone-500">
                <p>
                  {activeUnit.status === "OCCUPIED"
                    ? "Kamar sedang terisi tamu menginap."
                    : "Belum ada tamu terjadwal di kamar ini hari ini."}
                </p>
              </div>
            )}

            <div className="space-y-1 text-[11px] text-stone-500 pt-1">
              <p>✓ Kamar dibersihkan</p>
              <p>✓ Perlengkapan lengkap</p>
              <p>✓ Pemeriksaan oleh Rina, 09.10</p>
            </div>

            <div className="space-y-2 pt-2">
              {activeUnit.currentGuest && (
                <Link
                  href={`/admin/reservasi/${activeUnit.currentGuest.bookingCode}`}
                  className="block text-center w-full border border-stone-200 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold py-2 rounded transition"
                >
                  Lihat reservasi
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsStatusModalOpen(true)}
                className="w-full bg-[#0F2334] hover:bg-[#19354d] text-white text-xs font-semibold py-2.5 rounded transition cursor-pointer"
              >
                Ubah status kamar
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* TABEL TUGAS TATA GRAHA HARI INI */}
      <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg text-[#0F2334]">
              Tugas tata graha hari ini
            </h2>
            <p className="text-[11px] text-stone-400">
              {tasks.filter((t) => t.status !== "Perawatan").length} tugas
              persiapan kamar •{" "}
              {tasks.filter((t) => t.status === "Perawatan").length} tugas
              teknis
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="border border-stone-200 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold px-3.5 py-2 rounded transition cursor-pointer"
          >
            Tugaskan petugas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[10px] text-stone-500 uppercase">
                <th className="py-2.5 px-3 font-semibold">Kamar</th>
                <th className="py-2.5 px-3 font-semibold">Tugas</th>
                <th className="py-2.5 px-3 font-semibold">Petugas</th>
                <th className="py-2.5 px-3 font-semibold">Prioritas</th>
                <th className="py-2.5 px-3 font-semibold">Tenggat</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAF7F2]/50">
                  <td className="py-3 px-3 font-bold text-[#0F2334]">
                    {t.roomNumber}
                  </td>
                  <td className="py-3 px-3 text-[#0F2334]">{t.task}</td>
                  <td className="py-3 px-3 text-stone-600">{t.staff}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded ${
                        t.priority === "Tinggi"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-600">{t.deadline}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded ${
                        t.status === "Selesai"
                          ? "bg-emerald-50 text-emerald-700"
                          : t.status === "Dibersihkan"
                          ? "bg-[#EEF2F6] text-[#0F2334]"
                          : t.status === "Perawatan"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {t.status === "Menunggu" ? (
                      <button
                        type="button"
                        onClick={() => handleAdvanceTaskStatus(t.id)}
                        className="border border-stone-200 hover:border-[#0F2334] text-[#0F2334] text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer"
                      >
                        Mulai tugas
                      </button>
                    ) : t.status === "Dibersihkan" ? (
                      <button
                        type="button"
                        onClick={() => handleAdvanceTaskStatus(t.id)}
                        className="text-xs font-semibold text-[#0F2334] hover:underline cursor-pointer"
                      >
                        Periksa →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedRoomNumber(t.roomNumber)}
                        className="text-xs font-semibold text-[#0F2334] hover:underline cursor-pointer"
                      >
                        Detail →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BANNER INFO BAWAH */}
      <div className="bg-[#EEF2F6] border border-stone-200/80 rounded-md px-4 py-3 text-xs text-[#0F2334] flex items-center gap-2.5">
        <span>ⓘ</span>
        <span>
          Kamar dalam perawatan tidak ditawarkan kepada tamu. Status siap
          ditempati hanya dapat ditetapkan setelah pemeriksaan.
        </span>
      </div>

      {/* MODAL UBAH STATUS KAMAR */}
      {isStatusModalOpen && activeUnit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg text-[#0F2334]">
              Ubah status Kamar {activeUnit.roomNumber}
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { key: "READY", label: "Siap ditempati (Bersih & diperiksa)" },
                { key: "OCCUPIED", label: "Terisi (Tamu sedang menginap)" },
                { key: "DIRTY", label: "Perlu dibersihkan" },
                { key: "MAINTENANCE", label: "Dalam perawatan teknis" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() =>
                    handleChangeRoomStatus(opt.key as RoomUnit["status"])
                  }
                  className={`w-full text-left px-3.5 py-2.5 rounded border cursor-pointer transition ${
                    activeUnit.status === opt.key
                      ? "border-[#0F2334] bg-[#FAF7F2] font-bold"
                      : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="text-xs text-stone-500 hover:text-[#0F2334] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT TUGAS TATA GRAHA */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <h3 className="font-serif text-lg text-[#0F2334]">
              Buat tugas tata graha
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Nomor kamar</label>
                <input
                  type="text"
                  required
                  value={newTask.roomNumber}
                  onChange={(e) =>
                    setNewTask({ ...newTask, roomNumber: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Tenggat</label>
                <input
                  type="text"
                  required
                  value={newTask.deadline}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadline: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Jenis tugas</label>
              <input
                type="text"
                required
                value={newTask.task}
                onChange={(e) =>
                  setNewTask({ ...newTask, task: e.target.value })
                }
                className="w-full border border-stone-200 rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Petugas</label>
                <input
                  type="text"
                  required
                  value={newTask.staff}
                  onChange={(e) =>
                    setNewTask({ ...newTask, staff: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Prioritas</label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value as "Tinggi" | "Sedang",
                    })
                  }
                  className="w-full border border-stone-200 rounded px-3 py-2 bg-white"
                >
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="border border-stone-200 px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-[#0F2334] text-white px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Simpan tugas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}