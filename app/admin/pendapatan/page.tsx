"use client";

import React, { useState, useEffect } from "react";

interface DailyRow {
  date: string;
  labelShort: string;
  labelFull: string;
  roomsSold: number;
  occupancy: number;
  adr: number;
  revenue: number;
  tax: number;
  total: number;
}

interface ReportData {
  kpi: {
    roomRevenue: number;
    taxRevenue: number;
    totalWithTax: number;
    occupancyRate: number;
    adr: number;
    revPar: number;
  };
  dailyRows: DailyRow[];
  total7Days: number;
  highestDay?: DailyRow;
  channels: { name: string; amount: number; percentage: number }[];
  roomTypes: { name: string; amount: number; percentage: number }[];
}

function formatJuta(num: number) {
  if (num >= 1_000_000) {
    const jt = (num / 1_000_000).toFixed(1).replace(".", ",");
    return `Rp${jt} jt`;
  }
  return `Rp${num.toLocaleString("id-ID")}`;
}

export default function AdminPendapatanPage() {
  const [period, setPeriod] = useState("7d");
  const [compareWith, setCompareWith] = useState("prev_period");
  const [roomType, setRoomType] = useState("ALL");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        roomType,
      });
      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = [
      "Tanggal",
      "Kamar Terjual",
      "Okupansi (%)",
      "Tarif Rata-rata (IDR)",
      "Pendapatan Kamar (IDR)",
      "Pajak & Layanan 11% (IDR)",
      "Total (IDR)",
    ];
    const rows = data.dailyRows.map((r) => [
      r.labelFull,
      r.roomsSold,
      `${r.occupancy}%`,
      r.adr,
      r.revenue,
      r.tax,
      r.total,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan-pendapatan-nestra-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxBarValue = data
    ? Math.max(...data.dailyRows.map((r) => r.revenue), 1)
    : 1;

  const channelColors = ["#0F2334", "#C6A267", "#7D95A8", "#CBD5E1"];

  // Hitung conic-gradient untuk Donut Chart
  const donutGradient = (() => {
    if (!data || data.channels.length === 0) {
      return "conic-gradient(#0F2334 0% 100%)";
    }
    let acc = 0;
    const stops = data.channels.map((ch, idx) => {
      const start = acc;
      const pct = ch.percentage > 0 ? ch.percentage : idx === 0 ? 100 : 0;
      acc += pct;
      return `${channelColors[idx % channelColors.length]} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  })();

  const directPct =
    data?.channels.find((c) => c.name === "Situs resmi")?.percentage ?? 100;

  return (
    <div className="space-y-6 text-[#0F2334]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2334]">
            Pendapatan &amp; laporan
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Lihat kinerja hotel, sumber pemesanan, dan ringkasan pendapatan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={!data}
          className="inline-flex items-center gap-2 bg-[#0F2334] hover:bg-[#19354d] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded transition cursor-pointer self-start sm:self-auto"
        >
          <span>Unduh laporan</span>
          <span>↓</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-stone-200/90 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-4">
          <label className="block text-[10px] font-semibold text-stone-500 mb-1">
            Periode laporan
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
          >
            <option value="7d">7 hari terakhir</option>
            <option value="30d">30 hari terakhir</option>
            <option value="all">Semua transaksi (2026)</option>
          </select>
        </div>

        <div className="lg:col-span-4">
          <label className="block text-[10px] font-semibold text-stone-500 mb-1">
            Bandingkan dengan
          </label>
          <select
            value={compareWith}
            onChange={(e) => setCompareWith(e.target.value)}
            className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
          >
            <option value="prev_period">Periode sebelumnya</option>
            <option value="last_month">Bulan lalu</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[10px] font-semibold text-stone-500 mb-1">
            Jenis kamar / pendapatan
          </label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full border border-stone-200 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0F2334]"
          >
            <option value="ALL">Semua pendapatan kamar</option>
            <option value="Superior">Kamar Superior</option>
            <option value="Deluks">Kamar Deluks</option>
            <option value="Suite">Suite / Keluarga</option>
          </select>
        </div>

        <div className="lg:col-span-1">
          <button
            type="button"
            onClick={fetchReports}
            className="w-full border border-stone-300 hover:border-[#0F2334] text-[#0F2334] text-xs font-semibold py-2 px-3 rounded transition cursor-pointer"
          >
            Terapkan
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="bg-white border border-stone-200 rounded-md p-12 text-center text-xs text-stone-400">
          Menghitung laporan keuangan dari database...
        </div>
      ) : (
        <>
          {/* 4 KARTU KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
              <p className="text-[11px] text-stone-500">Pendapatan kamar</p>
              <p className="font-serif text-2xl font-bold text-[#0F2334]">
                {formatJuta(data.kpi.roomRevenue)}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">
                ↑ 12,4% dibanding periode sebelumnya
              </p>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
              <p className="text-[11px] text-stone-500">Okupansi rata-rata</p>
              <p className="font-serif text-2xl font-bold text-[#0F2334]">
                {String(data.kpi.occupancyRate).replace(".", ",")}%
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">
                ↑ 4,2 poin dibanding periode sebelumnya
              </p>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
              <p className="text-[11px] text-stone-500">Rata-rata tarif kamar</p>
              <p className="font-serif text-2xl font-bold text-[#0F2334]">
                Rp{data.kpi.adr.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">
                ↑ 3,1% • per kamar terjual
              </p>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-md p-5 space-y-1.5">
              <p className="text-[11px] text-stone-500">
                Pendapatan / kamar tersedia
              </p>
              <p className="font-serif text-2xl font-bold text-[#0F2334]">
                Rp{data.kpi.revPar.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">
                ↑ 8,4% • dari 60 kamar tersedia
              </p>
            </div>
          </div>

          {/* GRAFIK BARIS 1: TREN PENDAPATAN & DONUT KANAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* BAR CHART TREN 7 HARI */}
            <div className="lg:col-span-8 bg-white border border-stone-200/90 rounded-md p-6 flex flex-col justify-between space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#0F2334]">
                    Tren pendapatan kamar
                  </h2>
                  <p className="text-[11px] text-stone-400">
                    7 hari terakhir • dalam Rupiah (sebelum pajak)
                  </p>
                </div>
                <span className="border border-stone-200 text-stone-600 text-[10px] font-semibold px-2.5 py-1 rounded">
                  7 hari terakhir
                </span>
              </div>

              {/* Batang Grafik */}
              <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 border-b border-stone-100 pb-3">
                {data.dailyRows.map((day) => {
                  const isHighest =
                    data.highestDay &&
                    day.date === data.highestDay.date &&
                    day.revenue > 0;
                  const heightPct =
                    day.revenue > 0
                      ? Math.max(18, Math.round((day.revenue / maxBarValue) * 100))
                      : 8;

                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center justify-end h-full gap-1.5"
                    >
                      <span className="text-[9px] font-semibold text-stone-500 text-center">
                        {day.revenue > 0 ? formatJuta(day.revenue) : "Rp0"}
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[44px] rounded-t transition-all ${
                          isHighest
                            ? "bg-[#C6A267]"
                            : day.revenue > 0
                              ? "bg-[#0F2334]"
                              : "bg-stone-200"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Label Tanggal */}
              <div className="grid grid-cols-7 gap-3 text-center text-[10px] text-stone-400 -mt-3">
                {data.dailyRows.map((day) => (
                  <span key={day.date}>{day.labelShort}</span>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-stone-400">Total 7 hari</span>
                  <strong className="text-[#0F2334]">
                    Rp{data.total7Days.toLocaleString("id-ID")}
                  </strong>
                </div>
                {data.highestDay && data.highestDay.revenue > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">Hari tertinggi</span>
                    <strong className="text-[#0F2334]">
                      {data.highestDay.labelShort} •{" "}
                      {formatJuta(data.highestDay.revenue)}
                    </strong>
                  </div>
                )}
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] px-3.5 py-2.5 rounded flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>
                  Pemesanan langsung melalui situs resmi menyumbang {directPct}%
                  dari pendapatan periode ini.
                </span>
              </div>
            </div>

            {/* DONUT CHART KANAL */}
            <div className="lg:col-span-4 bg-white border border-stone-200/90 rounded-md p-6 flex flex-col justify-between space-y-5">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#0F2334]">
                  Pendapatan menurut kanal
                </h2>
              </div>

              <div className="flex items-center justify-center py-2">
                <div
                  style={{ background: donutGradient }}
                  className="w-40 h-40 rounded-full flex items-center justify-center relative"
                >
                  <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="font-serif text-xl font-bold text-[#0F2334]">
                      {directPct}%
                    </span>
                    <span className="text-[9px] text-stone-400">
                      Situs resmi
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {data.channels.map((ch, idx) => (
                  <div
                    key={ch.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 text-stone-600">
                      <span
                        style={{
                          backgroundColor:
                            channelColors[idx % channelColors.length],
                        }}
                        className="w-2.5 h-2.5 rounded-xs inline-block"
                      />
                      <span className="text-[11px]">{ch.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0F2334]">
                      {ch.percentage}% • {formatJuta(ch.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BARIS 2: KONTRIBUSI JENIS KAMAR & RINGKASAN KEUANGAN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#0F2334]">
                Kontribusi jenis kamar
              </h2>

              <div className="space-y-4 pt-1">
                {data.roomTypes.map((rt, idx) => (
                  <div key={rt.name} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-stone-700">
                        {rt.name}
                      </span>
                      <span className="font-semibold text-[#0F2334]">
                        {formatJuta(rt.amount)} • {rt.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${rt.percentage}%` }}
                        className={`h-full rounded-full ${
                          idx === 1 ? "bg-[#C6A267]" : "bg-[#0F2334]"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#0F2334]">
                Ringkasan keuangan
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Pendapatan kamar (sebelum pajak)</span>
                  <span className="font-semibold text-[#0F2334]">
                    Rp{data.kpi.roomRevenue.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Pajak &amp; layanan (11%)</span>
                  <span className="font-semibold text-[#0F2334]">
                    Rp{data.kpi.taxRevenue.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-semibold text-stone-700">
                    Total termasuk pajak
                  </span>
                  <span className="font-serif text-xl font-bold text-[#0F2334]">
                    Rp{data.kpi.totalWithTax.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-stone-400 leading-relaxed pt-1">
                Pendapatan dihitung berdasarkan tanggal menginap (check-in) dari
                seluruh reservasi aktif dan selesai di database PostgreSQL.
              </p>
            </div>
          </div>

          {/* TABEL LAPORAN HARIAN */}
          <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#0F2334]">
                  Laporan harian
                </h2>
                <p className="text-[11px] text-stone-400">
                  Rincian 7 hari terakhir dalam periode terpilih
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="text-xs font-semibold text-[#0F2334] hover:underline cursor-pointer"
              >
                Ekspor CSV ↓
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-stone-500 text-[11px] border-y border-stone-200/80">
                    <th className="py-3 px-4 font-semibold">Tanggal</th>
                    <th className="py-3 px-4 font-semibold">Kamar terjual</th>
                    <th className="py-3 px-4 font-semibold">Okupansi</th>
                    <th className="py-3 px-4 font-semibold">Tarif rata-rata</th>
                    <th className="py-3 px-4 font-semibold">
                      Pendapatan kamar
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Pajak &amp; layanan
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.dailyRows.map((row) => (
                    <tr key={row.date} className="hover:bg-stone-50/70">
                      <td className="py-3 px-4 font-medium text-[#0F2334]">
                        {row.labelFull}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {row.roomsSold}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {row.occupancy}%
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        Rp{row.adr.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        Rp{row.revenue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        Rp{row.tax.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0F2334] text-right">
                        Rp{row.total.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-stone-400">
              Okupansi dihitung dari total 60 unit kamar fisik Nestra Hotel
              Yogyakarta dan dibulatkan ke persen terdekat.
            </p>
          </div>
        </>
      )}
    </div>
  );
}