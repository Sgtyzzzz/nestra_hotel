"use client";

import React, { useEffect, useState } from "react";

interface RoomUnit {
  id: string;
  roomNumber: string;
  floor: number;
  category: string;
  status: "READY" | "OCCUPIED" | "DIRTY" | "MAINTENANCE";
}

export default function StaffHousekeepingPage() {
  const [units, setUnits] = useState<RoomUnit[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomUnit | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadUnits = async () => {
    const res = await fetch("/api/staff/operations");
    if (res.ok) {
      const json = await res.json();
      const list: RoomUnit[] = json.roomUnits || [];
      setUnits(list);
      const firstDirty = list.find((u) => u.status === "DIRTY");
      if (firstDirty && !selectedRoom) {
        setSelectedRoom(firstDirty);
      }
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleSetStatus = async (
    roomNumber: string,
    newStatus: RoomUnit["status"]
  ) => {
    setUpdating(true);
    try {
      await fetch("/api/staff/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_ROOM_UNIT",
          roomNumber,
          status: newStatus,
        }),
      });
      await loadUnits();
      setSelectedRoom((prev) =>
        prev && prev.roomNumber === roomNumber
          ? { ...prev, status: newStatus }
          : prev
      );
    } finally {
      setUpdating(false);
    }
  };

  const readyCount = units.filter((u) => u.status === "READY").length;
  const occupiedCount = units.filter((u) => u.status === "OCCUPIED").length;
  const dirtyCount = units.filter((u) => u.status === "DIRTY").length;
  const maintCount = units.filter((u) => u.status === "MAINTENANCE").length;

  const floors = [
    { level: 1, title: "Lantai 1", subtitle: "20 unit • Superior" },
    { level: 2, title: "Lantai 2", subtitle: "20 unit • Superior & Deluks" },
    { level: 3, title: "Lantai 3", subtitle: "20 unit • Deluks" },
  ];

  const getStyleByStatus = (status: RoomUnit["status"]) => {
    switch (status) {
      case "READY":
        return {
          box: "bg-emerald-50/90 border-emerald-200 text-emerald-900",
          label: "Siap Huni",
          labelColor: "text-emerald-700",
        };
      case "DIRTY":
        return {
          box: "bg-amber-50/90 border-amber-300 text-amber-950",
          label: "Perlu Dibersihkan",
          labelColor: "text-amber-700",
        };
      case "MAINTENANCE":
        return {
          box: "bg-red-50/90 border-red-200 text-red-900",
          label: "Perbaikan",
          labelColor: "text-red-600",
        };
      default:
        return {
          box: "bg-slate-100/80 border-slate-200 text-[#0F2334]",
          label: "Terisi",
          labelColor: "text-slate-500",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2334]">
            Kebersihan &amp; kesiapan kamar
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Pantau 60 unit kamar di lantai 1–3. Klik kamar untuk memperbarui
            status.
          </p>
        </div>
        <span className="text-[10px] tracking-widest uppercase text-[#B8893E] font-semibold">
          02 / HOUSEKEEPING
        </span>
      </div>

      <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-6">
        {/* LEGEND PILLS */}
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            ● Siap Huni • {readyCount}
          </span>
          <span className="px-3 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            ● Terisi • {occupiedCount}
          </span>
          <span className="px-3 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
            ● Perlu Dibersihkan • {dirtyCount}
          </span>
          <span className="px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200">
            ● Perbaikan • {maintCount}
          </span>
        </div>

        {/* GRID 3 LANTAI */}
        {floors.map((f) => {
          const floorUnits = units.filter((u) => u.floor === f.level);
          return (
            <div key={f.level} className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F2334]">{f.title}</span>
                <span className="text-[11px] text-stone-400">{f.subtitle}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                {floorUnits.map((unit) => {
                  const style = getStyleByStatus(unit.status);
                  const isSelected =
                    selectedRoom?.roomNumber === unit.roomNumber;

                  return (
                    <button
                      key={unit.roomNumber}
                      type="button"
                      onClick={() => setSelectedRoom(unit)}
                      className={`p-2.5 rounded border text-center transition cursor-pointer ${
                        style.box
                      } ${isSelected ? "ring-2 ring-[#0F2334]" : ""}`}
                    >
                      <span className="block font-bold text-sm">
                        {unit.roomNumber}
                      </span>
                      <span
                        className={`block text-[9px] font-semibold mt-0.5 truncate ${style.labelColor}`}
                      >
                        {style.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* BANNER AKSI KAMAR TERPILIH */}
        {selectedRoom && (
          <div className="bg-[#FAF5EB] border border-amber-200 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-xs text-[#92621A]">
                Kamar {selectedRoom.roomNumber} •{" "}
                {getStyleByStatus(selectedRoom.status).label}
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Pembersihan selesai? Tandai kamar siap untuk tamu berikutnya
                atau ubah status operasionalnya.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  handleSetStatus(selectedRoom.roomNumber, "DIRTY")
                }
                className="border border-amber-300 bg-white text-amber-800 px-3 py-2 rounded text-xs font-semibold cursor-pointer"
              >
                Perlu Dibersihkan
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  handleSetStatus(selectedRoom.roomNumber, "MAINTENANCE")
                }
                className="border border-red-200 bg-white text-red-700 px-3 py-2 rounded text-xs font-semibold cursor-pointer"
              >
                Perbaikan
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  handleSetStatus(selectedRoom.roomNumber, "READY")
                }
                className="bg-[#0F2334] hover:bg-[#19354d] text-white px-4 py-2 rounded text-xs font-semibold cursor-pointer"
              >
                Tandai Siap Huni
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}