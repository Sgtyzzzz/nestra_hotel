"use client";

import React, { useState, useEffect, useCallback } from "react";

interface StaffAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staff", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setStaffList(data.data);
      }
    } catch {
      // Abaikan error jaringan awal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mendaftarkan email.");
        return;
      }

      setSuccessMsg(
        `Akun ${data.data.role} untuk ${data.data.email} berhasil didaftarkan.`
      );
      setName("");
      setEmail("");
      setRole("STAFF");
      await fetchStaff();
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi saat menyimpan akun.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="font-serif text-3xl text-[#0F2334]">
          Kelola akun karyawan &amp; admin
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Daftarkan email Google karyawan untuk akses portal /staff. Email tidak
          boleh sama dengan akun tamu atau akun internal lain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORM PENDAFTARAN EMAIL */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-stone-200/90 rounded-md p-6 space-y-4 text-xs"
        >
          <h2 className="font-serif text-lg text-[#0F2334]">
            Daftarkan email baru
          </h2>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3.5 py-2.5">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-3.5 py-2.5">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#0F2334] mb-1">
              Nama lengkap *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dimas Saputra"
              className="w-full border border-stone-200 rounded px-3 py-2 focus:outline-none focus:border-[#0F2334]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0F2334] mb-1">
              Email Google *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: karyawan@gmail.com"
              className="w-full border border-stone-200 rounded px-3 py-2 focus:outline-none focus:border-[#0F2334]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0F2334] mb-1">
              Role akses *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "STAFF" | "ADMIN")}
              className="w-full border border-stone-200 rounded px-3 py-2 bg-white focus:outline-none focus:border-[#0F2334]"
            >
              <option value="STAFF">STAFF (Portal Karyawan /staff)</option>
              <option value="ADMIN">ADMIN (Dashboard Manajer /admin)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0F2334] hover:bg-[#19354d] disabled:opacity-60 text-white font-semibold py-2.5 rounded transition cursor-pointer"
          >
            {submitting ? "Menyimpan..." : "Daftarkan akun"}
          </button>
        </form>

        {/* DAFTAR AKUN TERDAFTAR */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#0F2334]">
              Akun internal terdaftar ({staffList.length})
            </h2>
          </div>

          {loading ? (
            <p className="py-8 text-center text-xs text-stone-400">
              Memuat daftar akun...
            </p>
          ) : staffList.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-400">
              Belum ada akun karyawan atau admin terdaftar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[10px] text-stone-500 uppercase">
                    <th className="py-2.5 px-3 font-semibold">Nama</th>
                    <th className="py-2.5 px-3 font-semibold">Email</th>
                    <th className="py-2.5 px-3 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {staffList.map((acc) => (
                    <tr key={acc.id} className="hover:bg-[#FAF7F2]/50">
                      <td className="py-3 px-3 font-medium text-[#0F2334]">
                        {acc.name}
                      </td>
                      <td className="py-3 px-3 text-stone-600">{acc.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded ${
                            acc.role === "ADMIN"
                              ? "bg-[#0F2334] text-white"
                              : "bg-[#EEF2F6] text-[#0F2334]"
                          }`}
                        >
                          {acc.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}