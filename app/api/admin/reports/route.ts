import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d"; // 7d | 30d | all
    const roomFilter = searchParams.get("roomType") || "ALL";

    const now = new Date();
    let startDate = new Date(now);
    if (period === "7d") {
      startDate.setDate(now.getDate() - 6);
    } else if (period === "30d") {
      startDate.setDate(now.getDate() - 29);
    } else {
      startDate = new Date("2026-01-01");
    }
    startDate.setHours(0, 0, 0, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        status: { not: "CANCELLED" },
        ...(roomFilter !== "ALL"
          ? {
              room: {
                name: { contains: roomFilter, mode: "insensitive" },
              },
            }
          : {}),
      },
      include: {
        room: true,
      },
      orderBy: { checkIn: "asc" },
    });

    const totalPhysicalRooms = 60; // Total 60 kamar fisik (3 lantai)

    // Hitung total keseluruhan periode terpilih
    const filteredBookings = bookings.filter((b) => {
      if (period === "all") return true;
      const ci = new Date(b.checkIn);
      return ci >= startDate && ci <= new Date(now.getTime() + 86400000 * 7);
    });

    const sourceBookings =
      filteredBookings.length > 0 ? filteredBookings : bookings;

    let roomRevenue = 0;
    let taxRevenue = 0;
    let totalRoomNights = 0;

    // Kontribusi per tipe kamar
    const roomTypeMap: Record<string, number> = {
      Superior: 0,
      Deluks: 0,
      "Kamar Keluarga": 0,
    };

    // Kanal pemesanan
    const channelMap: Record<string, number> = {
      "Situs resmi": 0,
      "Agen perjalanan daring": 0,
      Perusahaan: 0,
      "Datang langsung": 0,
    };

    sourceBookings.forEach((b) => {
      const sub =
        b.roomSubtotal ||
        Math.round((b.totalAmount || 0) / 1.11) ||
        (b.room?.basePrice || 650000) * (b.nights || 1);
      const tax = b.taxAmount || Math.round(sub * 0.11);
      const nights = b.nights || 1;

      roomRevenue += sub;
      taxRevenue += tax;
      totalRoomNights += nights;

      // Kelompokkan tipe kamar
      const rName = (b.room?.name || "").toLowerCase();
      if (rName.includes("deluk")) {
        roomTypeMap["Deluks"] += sub;
      } else if (rName.includes("suite") || rName.includes("keluarga")) {
        roomTypeMap["Kamar Keluarga"] += sub;
      } else {
        roomTypeMap["Superior"] += sub;
      }

      // Kelompokkan kanal dari kode / metode
      const code = (b.bookingCode || "").toUpperCase();
      if (code.includes("OTA")) {
        channelMap["Agen perjalanan daring"] += sub;
      } else if (code.includes("CORP")) {
        channelMap["Perusahaan"] += sub;
      } else if (code.includes("WALK")) {
        channelMap["Datang langsung"] += sub;
      } else {
        channelMap["Situs resmi"] += sub;
      }
    });

    const totalWithTax = roomRevenue + taxRevenue;
    const daysCount = period === "30d" ? 30 : 7;
    const availableRoomNights = totalPhysicalRooms * daysCount;
    const occupancyRate =
      availableRoomNights > 0
        ? Math.min(
            100,
            Number(((totalRoomNights / availableRoomNights) * 100).toFixed(1))
          )
        : 0;
    const adr =
      totalRoomNights > 0 ? Math.round(roomRevenue / totalRoomNights) : 0;
    const revPar =
      availableRoomNights > 0
        ? Math.round(roomRevenue / availableRoomNights)
        : 0;

    // Rincian 7 hari terakhir (Tren harian & Tabel Laporan Harian)
    const dailyRows = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const dayBookings = bookings.filter((b) => {
        const ciStr = new Date(b.checkIn).toISOString().slice(0, 10);
        const coStr = new Date(b.checkOut).toISOString().slice(0, 10);
        return dateStr >= ciStr && dateStr < coStr;
      });

      const roomsSold = dayBookings.length;
      const dayOccupancy = Math.round((roomsSold / totalPhysicalRooms) * 100);
      const daySub = dayBookings.reduce(
        (acc, b) => acc + (b.room?.basePrice || 750000),
        0
      );
      const dayTax = Math.round(daySub * 0.11);
      const dayTotal = daySub + dayTax;
      const dayAdr = roomsSold > 0 ? Math.round(daySub / roomsSold) : 0;

      const labelShort = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      const labelFull = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      dailyRows.push({
        date: dateStr,
        labelShort,
        labelFull,
        roomsSold,
        occupancy: dayOccupancy,
        adr: dayAdr,
        revenue: daySub,
        tax: dayTax,
        total: dayTotal,
      });
    }

    const total7Days = dailyRows.reduce((acc, r) => acc + r.revenue, 0);
    const highestDay = [...dailyRows].sort((a, b) => b.revenue - a.revenue)[0];

    const safeTotal = roomRevenue > 0 ? roomRevenue : 1;

    const channels = Object.entries(channelMap).map(([name, amount]) => ({
      name,
      amount,
      percentage:
        roomRevenue > 0 ? Math.round((amount / safeTotal) * 100) : 0,
    }));

    const roomTypes = Object.entries(roomTypeMap).map(([name, amount]) => ({
      name,
      amount,
      percentage:
        roomRevenue > 0 ? Math.round((amount / safeTotal) * 100) : 0,
    }));

    return NextResponse.json({
      kpi: {
        roomRevenue,
        taxRevenue,
        totalWithTax,
        occupancyRate,
        adr,
        revPar,
      },
      dailyRows,
      total7Days,
      highestDay,
      channels,
      roomTypes,
    });
  } catch (error) {
    console.error("Error fetching financial reports:", error);
    return NextResponse.json(
      { error: "Gagal memuat laporan pendapatan" },
      { status: 500 }
    );
  }
}