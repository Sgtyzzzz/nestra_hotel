import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD

    const targetDate = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const targetStr = targetDate.toISOString().slice(0, 10);

    const yesterday = new Date(targetDate);
    yesterday.setDate(yesterday.getDate() - 1);

    const bookings = await prisma.booking.findMany({
      include: { room: true },
      where: { status: { not: "CANCELLED" } },
      orderBy: { checkIn: "asc" },
    });

    const totalRooms = 60;

    // 1. Okupansi malam ini & kemarin
    const occupiedTonight = bookings.filter((b) => {
      const ci = new Date(b.checkIn);
      ci.setHours(0, 0, 0, 0);
      const co = new Date(b.checkOut);
      co.setHours(0, 0, 0, 0);
      return ci <= targetDate && co > targetDate;
    });

    const occupiedYesterday = bookings.filter((b) => {
      const ci = new Date(b.checkIn);
      ci.setHours(0, 0, 0, 0);
      const co = new Date(b.checkOut);
      co.setHours(0, 0, 0, 0);
      return ci <= yesterday && co > yesterday;
    });

    const occupancyRate = Math.round((occupiedTonight.length / totalRooms) * 100);
    const yesterdayRate = Math.round(
      (occupiedYesterday.length / totalRooms) * 100
    );
    const occupancyDiff = occupancyRate - yesterdayRate;

    // 2. Pendapatan kamar hari ini (dari kamar terpesan hari ini atau transaksi hari ini)
    const todayRevenue = occupiedTonight.reduce(
      (sum, b) => sum + Math.round(b.roomSubtotal / Math.max(1, b.nights)),
      0
    );

    // 3. Kedatangan & keberangkatan pada tanggal terpilih
    const arrivals = bookings
      .filter((b) => b.checkIn.toISOString().slice(0, 10) === targetStr)
      .map((b, idx) => ({
        bookingCode: b.bookingCode,
        guestName: `${b.guestFirstName} ${
          b.guestLastName === "-" ? "" : b.guestLastName
        }`.trim(),
        roomName: b.room.name.replace("Kamar ", ""),
        roomNumber: `${101 + ((idx + b.nights) % 3) * 100 + (idx % 9)}`,
        arrivalTime: b.arrivalTime || "14.00–15.00 WIB",
        paymentStatus: b.paymentStatus,
        status: b.status,
      }));

    const departures = bookings
      .filter((b) => b.checkOut.toISOString().slice(0, 10) === targetStr)
      .map((b, idx) => ({
        bookingCode: b.bookingCode,
        guestName: `${b.guestFirstName} ${
          b.guestLastName === "-" ? "" : b.guestLastName
        }`.trim(),
        roomName: b.room.name.replace("Kamar ", ""),
        roomNumber: `${101 + ((idx + b.nights) % 3) * 100 + (idx % 9)}`,
        status: b.status,
      }));

    // 4. Grafik 7 hari terakhir (H-6 s.d. Hari ini)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(targetDate);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const activeOnDay = bookings.filter((b) => {
        const ci = new Date(b.checkIn);
        ci.setHours(0, 0, 0, 0);
        const co = new Date(b.checkOut);
        co.setHours(0, 0, 0, 0);
        return ci <= d && co > d;
      });

      const dayRev = activeOnDay.reduce(
        (sum, b) => sum + Math.round(b.roomSubtotal / Math.max(1, b.nights)),
        0
      );

      last7Days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        occupiedCount: activeOnDay.length,
        occupancyPct: Math.round((activeOnDay.length / totalRooms) * 100),
        revenue: dayRev,
      });
    }

    const avg7DaysOccupancy = Math.round(
      last7Days.reduce((s, d) => s + d.occupancyPct, 0) / 7
    );

    return NextResponse.json({
      date: targetStr,
      totalRooms,
      occupiedCount: occupiedTonight.length,
      occupancyRate,
      occupancyDiff,
      todayRevenue,
      arrivals,
      departures,
      last7Days,
      avg7DaysOccupancy,
    });
  } catch (error) {
    console.error("Admin Summary GET Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat ringkasan hotel" },
      { status: 500 }
    );
  }
}