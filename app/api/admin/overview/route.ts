import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil profil admin asli dari tabel Admin berdasarkan Gmail yang login
  const adminRecord = await prisma.admin.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  const adminProfile = {
    name: adminRecord?.name || session.user.name || "Admin Nestra",
    email: session.user.email,
    roleLabel:
      adminRecord?.role === "SUPER_ADMIN"
        ? "Manajer Hotel"
        : adminRecord?.role === "ADMIN"
        ? "Administrator Hotel"
        : "Staf Operasional",
  };

  // Ambil data reservasi, kamar, dan pesan kontak dari PostgreSQL
  const [bookings, rooms, unreadContacts] = await Promise.all([
    prisma.booking.findMany({
      include: { room: true },
      orderBy: { checkIn: "asc" },
    }),
    prisma.room.findMany(),
    prisma.contactMessage.count({
      where: { isRead: false },
    }),
  ]);

  const upcomingBookings = bookings.filter((b) => b.status === "UPCOMING");
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  const totalRevenueBeforeTax = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + (b.roomSubtotal - b.discountAmount), 0);

  return NextResponse.json({
    admin: adminProfile,
    stats: {
      totalRooms: rooms.length,
      upcomingCount: upcomingBookings.length,
      completedCount: completedBookings.length,
      revenueBeforeTax: totalRevenueBeforeTax,
      unreadContacts,
    },
    bookings,
  });
}