import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [rooms, bookings] = await Promise.all([
      prisma.room.findMany({ orderBy: { basePrice: "asc" } }),
      prisma.booking.findMany({
        include: { room: true },
        where: { status: { not: "CANCELLED" } },
        orderBy: { checkIn: "asc" },
      }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Pisahkan tamu yang sedang menginap / tiba hari ini vs yang akan datang
    const activeByRoomId: Record<string, typeof bookings> = {};
    const upcomingByRoomId: Record<string, typeof bookings> = {};

    for (const b of bookings) {
      const ci = new Date(b.checkIn);
      ci.setHours(0, 0, 0, 0);
      const co = new Date(b.checkOut);
      co.setHours(0, 0, 0, 0);

      if ((b.status === "UPCOMING" || b.status === "PENDING") && ci <= today && co >= today) {
        if (!activeByRoomId[b.roomId]) activeByRoomId[b.roomId] = [];
        activeByRoomId[b.roomId].push(b);
      } else if ((b.status === "UPCOMING" || b.status === "PENDING") && ci > today) {
        if (!upcomingByRoomId[b.roomId]) upcomingByRoomId[b.roomId] = [];
        upcomingByRoomId[b.roomId].push(b);
      }
    }

    const roomTypes =
      rooms.length > 0
        ? rooms
        : [
            { id: "sup", name: "Superior", bedType: "1 ranjang queen" },
            { id: "dlx", name: "Deluks", bedType: "1 ranjang besar" },
            { id: "fam", name: "Keluarga", bedType: "2 ranjang besar" },
          ];

    const units = [];

    for (let floor = 1; floor <= 3; floor++) {
      for (let num = 1; num <= 20; num++) {
        const roomNumber = `${floor}${String(num).padStart(2, "0")}`;
        // Lantai 1 = Superior, Lantai 2 = Deluks, Lantai 3 = Keluarga (atau rotasi sesuai DB)
        const typeObj =
          roomTypes[(floor - 1) % roomTypes.length] || roomTypes[0];
        const cleanTypeName = typeObj.name.replace("Kamar ", "");

        let status: "OCCUPIED" | "READY" | "CLEANING" | "MAINTENANCE" = "READY";
        let currentGuest = null;

        // Ambil tamu yang memesan tipe kamar yang SAMA
        const matchedActive = activeByRoomId[typeObj.id]?.shift();
        if (matchedActive) {
          const ci = new Date(matchedActive.checkIn);
          ci.setHours(0, 0, 0, 0);
          const isToday = ci.getTime() === today.getTime();

          status = isToday ? "READY" : "OCCUPIED";
          currentGuest = {
            bookingCode: matchedActive.bookingCode,
            guestName: `${matchedActive.guestFirstName} ${
              matchedActive.guestLastName === "-"
                ? ""
                : matchedActive.guestLastName
            }`.trim(),
            dates: `${new Date(matchedActive.checkIn).toLocaleDateString(
              "id-ID",
              { day: "numeric" }
            )}–${new Date(matchedActive.checkOut).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`,
            adults: matchedActive.adults,
            arrivalTime: matchedActive.arrivalTime || "14.00–15.00 WIB",
            isArrivingToday: isToday,
          };
        } else if (
          (floor === 3 && num === 12) ||
          (floor === 2 && num === 18)
        ) {
          status = "MAINTENANCE";
        } else if (
          (floor === 2 && (num === 4 || num === 8)) ||
          (floor === 1 && (num === 5 || num === 14))
        ) {
          status = "CLEANING";
        } else if (num % 3 === 1 && upcomingByRoomId[typeObj.id]?.length) {
          const matchedUpcoming = upcomingByRoomId[typeObj.id].shift()!;
          currentGuest = {
            bookingCode: matchedUpcoming.bookingCode,
            guestName: `${matchedUpcoming.guestFirstName} ${
              matchedUpcoming.guestLastName === "-"
                ? ""
                : matchedUpcoming.guestLastName
            }`.trim(),
            dates: `${new Date(matchedUpcoming.checkIn).toLocaleDateString(
              "id-ID",
              { day: "numeric" }
            )}–${new Date(matchedUpcoming.checkOut).toLocaleDateString(
              "id-ID",
              { day: "numeric", month: "short", year: "numeric" }
            )}`,
            adults: matchedUpcoming.adults,
            arrivalTime: matchedUpcoming.arrivalTime || "14.00–15.00 WIB",
            isArrivingToday: false,
          };
        }

        units.push({
          roomNumber,
          floor,
          typeName: cleanTypeName,
          bedType: typeObj.bedType || "1 ranjang besar",
          status,
          currentGuest,
        });
      }
    }

    return NextResponse.json(units);
  } catch (error) {
    console.error("Admin Rooms GET Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data kamar & kebersihan" },
      { status: 500 }
    );
  }
}