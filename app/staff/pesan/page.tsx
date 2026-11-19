"use client";

import React, { useEffect, useState } from "react";

interface MessageItem {
  id: string;
  fullName: string;
  email: string;
  topic: string;
  bookingCode?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function StaffMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [tab, setTab] = useState<"NEW" | "ALL">("NEW");
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/operations");
      if (res.ok) {
        const json = await res.json();
        setMessages(json.messages || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkDone = async (messageId: string) => {
    await fetch("/api/staff/operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_MESSAGE", messageId }),
    });
    loadMessages();
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const displayed =
    tab === "NEW" ? messages.filter((m) => !m.isRead) : messages;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2334]">
          Pesan tamu
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Kelola pertanyaan dan permintaan dari formulir kontak website.
        </p>
      </div>

      <div className="bg-white border border-stone-200/90 rounded-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">
            Kotak masuk pesan tamu
          </h2>
          <span className="bg-stone-100 text-stone-600 text-[11px] font-semibold px-2.5 py-1 rounded">
            {unreadCount} baru
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTab("NEW")}
            className={`px-3.5 py-1.5 rounded font-semibold cursor-pointer ${
              tab === "NEW"
                ? "bg-[#0F2334] text-white"
                : "border border-stone-200 text-stone-600"
            }`}
          >
            Baru ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setTab("ALL")}
            className={`px-3.5 py-1.5 rounded font-semibold cursor-pointer ${
              tab === "ALL"
                ? "bg-[#0F2334] text-white"
                : "border border-stone-200 text-stone-600"
            }`}
          >
            Semua pesan ({messages.length})
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-stone-400 py-6 text-center">
            Memuat kotak masuk...
          </p>
        ) : displayed.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">
            Tidak ada pesan pada kategori ini.
          </p>
        ) : (
          <div className="space-y-3">
            {displayed.map((msg) => (
              <div
                key={msg.id}
                className="border border-stone-200 rounded-md p-5 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-[#0F2334]">
                      {msg.fullName}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB • Form kontak website ({msg.email})
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                      msg.isRead
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {msg.isRead ? "Ditindaklanjuti" : "Baru"}
                  </span>
                </div>

                <p className="font-semibold text-[#0F2334]">{msg.topic}</p>
                <p className="text-stone-600 leading-relaxed">{msg.message}</p>

                {!msg.isRead ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleMarkDone(msg.id)}
                      className="border border-stone-200 hover:border-[#0F2334] px-3 py-1.5 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Tandai dibaca
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkDone(msg.id)}
                      className="bg-[#0F2334] hover:bg-[#19354d] text-white px-3.5 py-1.5 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Ditindaklanjuti
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-700 font-medium pt-1">
                    ✓ Ditangani Dimas
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}