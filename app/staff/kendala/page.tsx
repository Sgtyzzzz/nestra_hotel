"use client";

import React, { useEffect, useState } from "react";

interface IncidentItem {
  id: string;
  ticketCode: string;
  title: string;
  roomNumber?: string | null;
  guestName?: string | null;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function StaffEscalationPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [title, setTitle] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">(
    "NORMAL"
  );
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadIncidents = async () => {
    const res = await fetch("/api/staff/operations");
    if (res.ok) {
      const json = await res.json();
      setIncidents(json.incidents || []);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const submitReport = async (escalate: boolean) => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/staff/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_INCIDENT",
          title,
          roomNumber,
          guestName,
          priority,
          description,
          escalate,
        }),
      });
      if (res.ok) {
        setTitle("");
        setRoomNumber("");
        setGuestName("");
        setDescription("");
        setPriority("NORMAL");
        loadIncidents();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const escalatedList = incidents.filter((i) => i.status === "ESCALATED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2334]">
          Kendala &amp; eskalasi
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Catat kendala operasional dan pantau tindak lanjut manajer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORM CATAT KENDALA TAMU */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
          <div>
            <h2 className="font-serif text-lg font-bold">Catat kendala tamu</h2>
            <p className="text-xs text-stone-500">
              Catat kronologi sebelum menyimpan atau meneruskan ke manajer.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Judul kendala *
              </label>
              <input
                type="text"
                placeholder="Contoh: Keluhan fasilitas kamar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Nomor kamar *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 312"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full border border-stone-200 rounded px-3 py-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Nama tamu *
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama tamu"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full border border-stone-200 rounded px-3 py-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-600 mb-1.5">
                Tingkat prioritas *
              </label>
              <div className="flex gap-2">
                {[
                  { key: "NORMAL", label: "Normal" },
                  { key: "HIGH", label: "Tinggi" },
                  { key: "URGENT", label: "Mendesak" },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() =>
                      setPriority(p.key as "NORMAL" | "HIGH" | "URGENT")
                    }
                    className={`px-3.5 py-1.5 rounded font-semibold cursor-pointer ${
                      priority === p.key
                        ? "bg-[#0F2334] text-white"
                        : "border border-stone-200 text-stone-600"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Kronologi kejadian *
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan waktu kejadian, keluhan tamu, serta tindakan awal yang sudah dilakukan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-stone-200 rounded px-3 py-2.5"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                disabled={submitting}
                onClick={() => submitReport(false)}
                className="border border-stone-300 hover:border-[#0F2334] text-[#0F2334] font-semibold px-4 py-2.5 rounded cursor-pointer"
              >
                Simpan kendala
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submitReport(true)}
                className="bg-[#0F2334] hover:bg-[#19354d] text-white font-semibold px-4 py-2.5 rounded cursor-pointer"
              >
                Eskalasi ke manajer ↗
              </button>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: DIESKALASI KE ATASAN */}
        <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold">
              Dieskalasi ke atasan
            </h2>
            <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded">
              {escalatedList.length} aktif
            </span>
          </div>

          {escalatedList.length === 0 ? (
            <p className="text-xs text-stone-400">
              Belum ada kendala yang dieskalasi ke manajer.
            </p>
          ) : (
            <div className="space-y-3 text-xs">
              {escalatedList.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-stone-100 pb-3 flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-[#0F2334]">
                      #{item.ticketCode} • {item.title}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {item.guestName || "Tamu"}{" "}
                      {item.roomNumber ? `• Kamar ${item.roomNumber}` : ""}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.priority === "URGENT"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {item.priority === "URGENT"
                      ? "Mendesak"
                      : item.priority === "HIGH"
                        ? "Tinggi"
                        : "Normal"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-stone-400">
            Menunggu tindak lanjut manajer.
          </p>

          <div className="bg-[#FAF5EB] border border-amber-200/80 rounded p-4 space-y-1 text-xs">
            <p className="font-bold text-[#92621A]">Kapan perlu eskalasi?</p>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Komplain besar, permintaan refund, atau masalah di luar
              kewenangan karyawan akan diteruskan ke dashboard /admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}