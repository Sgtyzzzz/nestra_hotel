import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, topic, bookingCode, message } = body;

    if (!fullName || !message) {
      return NextResponse.json(
        { error: "Nama dan isi pesan wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.contactMessage.create({
      data: {
        fullName: String(fullName).trim(),
        email: email ? String(email).trim() : "tamu@nestrahotel.id",
        topic: topic ? String(topic).trim() : "Pesan / Aduan Tamu",
        bookingCode: bookingCode ? String(bookingCode).trim() : null,
        message: String(message).trim(),
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pesan ke resepsionis" },
      { status: 500 }
    );
  }
}