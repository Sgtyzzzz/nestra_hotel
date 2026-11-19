"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface SummaryData {
  date: string;
  totalRooms: number;
  occupiedCount: number;
  occupancyRate: number;
  occupancyDiff: number;
  todayRevenue: number;
  arrivals: {
    bookingCode: string;
    guestName: string;
    roomName: string;
    roomNumber: string;
    arrivalTime: string;
    paymentStatus: string;
    status: string;
  }[];
  departures: {
    bookingCode: string;
    guestName: string;
    roomName: string;
    roomNumber: string;
    status: string;
  }[];
  last7Days: {
    date: string;
    label: string;
    occupiedCount: number;
    occupancyPct: number;
    revenue: number;
  }[];
  avg7DaysOccupancy: number;
}

interface EscalatedIncident {
  id: string;
  ticketCode: string;
  title: string;
  roomNumber: string | null;
  guestName: string | null;
  description: string;
  priority: string;
  status: string;
  reportedBy: string;
}

export default function AdminDashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ARRIVALS" | "DEPARTURES">(
    "ARRIVALS"
  );

  // State sinkronisasi dari portal karyawan (/staff/kendala & /staff/kamar)
  const [escalatedIncidents, setEscalatedIncidents] = useState<
    EscalatedIncident[]
  >([]);
  const [roomCounts, setRoomCounts] = useState({ dirty: 0, maintenance: 0 });
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadStaffSyncData = useCallback(async () => {
    try {
      const res = await fetch("/api/staff/operations", { cache: "no-store" });
      if (res.ok) {
        const staffData = await res.json();
        const incidents: EscalatedIncident[] = staffData.incidents || [];
        const units: { status: string }[] = staffData.roomUnits || [];

        setEscalatedIncidents(
          incidents.filter((i) => i.status === "ESCALATED")
        );
        setRoomCounts({
          dirty: units.filter((u) => u.status === "DIRTY").length,
          maintenance: units.filter((u) => u.status === "MAINTENANCE").length,
        });
      }
    } catch {
      // Abaikan jika gagal memuat data tambahan
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/summary?date=${selectedDate}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));

    loadStaffSyncData();
  }, [selectedDate, loadStaffSyncData]);

  const handleResolveIncident = async (incidentId: string) => {
    setResolvingId(incidentId);
    try {
      const res = await fetch("/api/staff/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESOLVE_INCIDENT",
          incidentId,
        }),
      });
      if (res.ok) {
        setEscalatedIncidents((prev) =>
          prev.filter((item) => item.id !== incidentId)
        );
      }
    } finally {
      setResolvingId(null);
    }
  };

  const maxRev = Math.max(
    1000000,
    ...(data?.last7Days.map((d) => d.revenue) || [0])
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#0F2334]">
            Ringkasan hotel
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Selamat pagi, Rani. Berikut keadaan hotel dan agenda hari ini.
          </p>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white border border-stone-200 rounded px-3.5 py-2 text-xs font-medium text-[#0F2334]"
        />
      </div>

      {/* 4 KARTU KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Okupansi malam ini</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : `${data?.occupancyRate ?? 0}%`}
          </p>
          <p className="text-[10px] text-stone-400">
            {data?.occupiedCount ?? 0} dari {data?.totalRooms ?? 60} kamar •{" "}
            <span className="text-emerald-700 font-semibold">
              {(data?.occupancyDiff ?? 0) >= 0
                ? `+${data?.occupancyDiff ?? 0}`
                : data?.occupancyDiff}{" "}
              poin dari kemarin
            </span>
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Pendapatan kamar hari ini</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading
              ? "..."
              : `Rp${(data?.todayRevenue ?? 0).toLocaleString("id-ID")}`}
          </p>
          <p className="text-[10px] text-stone-400">
            Berdasarkan kamar terpesan • sebelum pajak
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Kedatangan hari ini</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : data?.arrivals.length ?? 0}
          </p>
          <p className="text-[10px] text-stone-400">
            {data?.arrivals.filter((a) => a.status === "COMPLETED").length ?? 0}{" "}
            sudah masuk •{" "}
            {data?.arrivals.filter((a) => a.status !== "COMPLETED").length ?? 0}{" "}
            dijadwalkan
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
          <p className="text-[11px] text-stone-500">Keberangkatan hari ini</p>
          <p className="font-serif text-3xl font-bold text-[#0F2334]">
            {loading ? "..." : data?.departures.length ?? 0}
          </p>
          <p className="text-[10px] text-stone-400">
            {data?.departures.filter((d) => d.status === "COMPLETED").length ??
              0}{" "}
            sudah keluar •{" "}
            {data?.departures.filter((d) => d.status !== "COMPLETED").length ??
              0}{" "}
            dijadwalkan
          </p>
        </div>
      </div>

      {/* BANNER STATUS KAMAR (SINKRON DENGAN ROOMUNIT) */}
      <div className="bg-[#FAF4E8] border border-[#E8D8B9] rounded-md px-4 py-3 text-xs text-[#6E5323] flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span>ⓘ</span>
          <span>
            {roomCounts.dirty} kamar perlu dibersihkan dan{" "}
            {roomCounts.maintenance} kamar dalam perawatan. Pastikan kesiapan
            untuk {data?.arrivals.length ?? 0} kedatangan hari ini.
          </span>
        </div>
        <Link
          href="/admin/kamar"
          className="font-semibold underline shrink-0 hover:text-[#0F2334]"
        >
          Cek kamar →
        </Link>
      </div>

      {/* 2 GRAFIK 7 HARI TERAKHIR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg text-[#0F2334]">
                Okupansi • 7 hari terakhir
              </h2>
              <p className="text-[11px] text-stone-400">
                Kamar terpesan / 60 kamar
              </p>
            </div>
            <span className="bg-[#EEF2F6] text-[#0F2334] text-[10px] font-semibold px-2.5 py-1 rounded">
              Rata-rata {data?.avg7DaysOccupancy ?? 0}%
            </span>
          </div>

          <div className="h-40 flex items-end gap-3 pt-4 border-b border-stone-100">
            {(data?.last7Days || []).map((day) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <span className="text-[10px] font-semibold text-[#0F2334]">
                  {day.occupancyPct}%
                </span>
                <div className="w-full bg-[#FAF7F2] rounded-t h-28 flex items-end">
                  <div
                    style={{
                      height: `${Math.max(6, day.occupancyPct)}%`,
                    }}
                    className="w-full bg-[#0F2334] rounded-t transition-all"
                  />
                </div>
                <span className="text-[10px] text-stone-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg text-[#0F2334]">
                Pendapatan kamar • 7 hari terakhir
              </h2>
              <p className="text-[11px] text-stone-400">
                Dalam Rupiah • sebelum pajak
              </p>
            </div>
            <span className="text-xs font-bold text-[#0F2334]">
              Rp{(data?.todayRevenue ?? 0).toLocaleString("id-ID")} hari ini
            </span>
          </div>

          <div className="h-40 flex items-end gap-3 pt-4 border-b border-stone-100">
            {(data?.last7Days || []).map((day) => {
              const barPct = Math.round((day.revenue / maxRev) * 100);
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <span className="text-[9px] font-semibold text-[#0F2334]">
                    {day.revenue > 0
                      ? `${(day.revenue / 1000000).toFixed(1)}jt`
                      : "0"}
                  </span>
                  <div className="w-full bg-[#FAF7F2] rounded-t h-28 flex items-end">
                    <div
                      style={{ height: `${Math.max(6, barPct)}%` }}
                      className="w-full bg-[#C6A267] rounded-t transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BAWAH: KEDATANGAN & KEBERANGKATAN + PRIORITAS OPERASIONAL (ESKALASI KARYAWAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#0F2334]">
              Kedatangan &amp; keberangkatan
            </h2>
            <Link
              href="/admin/reservasi"
              className="text-xs font-semibold text-[#0F2334] hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="flex items-center gap-6 border-b border-stone-200 pb-2.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("ARRIVALS")}
              className={`pb-2.5 -mb-[11px] cursor-pointer ${
                activeTab === "ARRIVALS"
                  ? "border-b-2 border-[#0F2334] font-bold text-[#0F2334]"
                  : "text-stone-400"
              }`}
            >
              Kedatangan ({data?.arrivals.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("DEPARTURES")}
              className={`pb-2.5 -mb-[11px] cursor-pointer ${
                activeTab === "DEPARTURES"
                  ? "border-b-2 border-[#0F2334] font-bold text-[#0F2334]"
                  : "text-stone-400"
              }`}
            >
              Keberangkatan ({data?.departures.length ?? 0})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] text-[10px] text-stone-500 uppercase">
                  <th className="py-2 px-3">Tamu</th>
                  <th className="py-2 px-3">Kamar</th>
                  <th className="py-2 px-3">Perkiraan</th>
                  <th className="py-2 px-3">Pembayaran</th>
                  <th className="py-2 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeTab === "ARRIVALS" ? (
                  (data?.arrivals || []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-stone-400"
                      >
                        Tidak ada jadwal kedatangan pada tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    data!.arrivals.map((a) => (
                      <tr key={a.bookingCode}>
                        <td className="py-3 px-3 font-medium text-[#0F2334]">
                          {a.guestName}
                        </td>
                        <td className="py-3 px-3 text-stone-600">
                          {a.roomNumber} · {a.roomName}
                        </td>
                        <td className="py-3 px-3 text-stone-500">
                          {a.arrivalTime}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              a.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {a.paymentStatus === "PAID"
                              ? "Lunas"
                              : "Belum lunas"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/admin/reservasi/${a.bookingCode}`}
                            className="font-semibold text-[#0F2334] hover:underline"
                          >
                            Detail ↗
                          </Link>
                        </td>
                      </tr>
                    ))
                  )
                ) : (data?.departures || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      Tidak ada jadwal keberangkatan pada tanggal ini.
                    </td>
                  </tr>
                ) : (
                  data!.departures.map((d) => (
                    <tr key={d.bookingCode}>
                      <td className="py-3 px-3 font-medium text-[#0F2334]">
                        {d.guestName}
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        {d.roomNumber} · {d.roomName}
                      </td>
                      <td className="py-3 px-3 text-stone-500">12.00 WIB</td>
                      <td className="py-3 px-3">
                        <span className="bg-stone-100 text-stone-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/admin/reservasi/${d.bookingCode}`}
                          className="font-semibold text-[#0F2334] hover:underline"
                        >
                          Detail ↗
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KANAN: PRIORITAS OPERASIONAL & ESKALASI DARI KARYAWAN */}
        <div className="lg:col-span-4 bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#0F2334]">
              Prioritas &amp; eskalasi
            </h2>
            {escalatedIncidents.length > 0 && (
              <span className="bg-red-50 text-red-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                {escalatedIncidents.length} eskalasi
              </span>
            )}
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {escalatedIncidents.length === 0 ? (
              <p className="py-6 text-center text-stone-400">
                Tidak ada kendala yang dieskalasi karyawan saat ini.
              </p>
            ) : (
              escalatedIncidents.map((inc) => (
                <div key={inc.id} className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        inc.priority === "URGENT"
                          ? "bg-red-50 text-red-700"
                          : inc.priority === "HIGH"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {inc.priority === "URGENT"
                        ? "Mendesak"
                        : inc.priority === "HIGH"
                        ? "Tinggi"
                        : "Normal"}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      #{inc.ticketCode}
                    </span>
                  </div>

                  <p className="font-semibold text-[#0F2334]">{inc.title}</p>

                  <p className="text-[11px] text-stone-500">
                    {inc.guestName ? `${inc.guestName} • ` : ""}
                    {inc.roomNumber ? `Kamar ${inc.roomNumber}` : "Umum"} •
                    Dilaporkan {inc.reportedBy}
                  </p>

                  {inc.description && (
                    <p className="text-[11px] text-stone-400 line-clamp-2">
                      {inc.description}
                    </p>
                  )}

                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={resolvingId === inc.id}
                      onClick={() => handleResolveIncident(inc.id)}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      {resolvingId === inc.id
                        ? "Menyelesaikan..."
                        : "Tandai selesai ✓"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}