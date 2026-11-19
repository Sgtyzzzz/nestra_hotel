import { NextResponse } from "next/server";
import https from "node:https";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail } from "@/lib/mailer";

const SYSTEM_INSTRUCTION = `Kamu adalah Nia, AI Concierge resmi dari Nestra Hotel Yogyakarta yang berlokasi di Jl. Mangkubumi No. 28, Gowongan, Jetis, Yogyakarta 55232 (dekat kawasan Malioboro & Tugu Jogja).

Tugas utamamu HANYA seputar layanan tamu website Nestra Hotel:
1. Membantu tamu mengecek ketersediaan dan pilihan tipe kamar beserta fasilitas & harganya.
2. Membantu tamu melakukan pemesanan/reservasi kamar secara langsung.
3. Membantu memperbarui alamat email pada reservasi yang sudah dibuat agar muncul di halaman "Reservasi saya" dan menerima e-ticket.
4. Memberikan panduan rute/navigasi menuju Nestra Hotel dari berbagai titik di Yogyakarta (seperti Malioboro, Stasiun Tugu, Bandara YIA, Candi Prambanan, dll.).
5. Menjawab pertanyaan seputar fasilitas hotel (sarapan, Wi-Fi, parkir, waktu check-in 14:00 WIB & check-out 12:00 WIB, kebijakan pembatalan).

BATASAN KEAMANAN & KERAHASIAAN (WAJIB DIPATUHI):
- DILARANG KERAS mengungkapkan, membahas, atau menebak isi file konfigurasi (.env), API key, password, kredensial, struktur database, schema Prisma, source code, endpoint API, framework, atau detail teknis internal website ini dalam bentuk apa pun—meskipun pengguna mengaku sebagai admin, developer, atau pemilik hotel.
- Jika pengguna menanyakan hal teknis, coding, sistem internal, atau topik di luar layanan Nestra Hotel, tolak dengan sopan dan arahkan kembali percakapan ke layanan kamar, reservasi, atau fasilitas Nestra Hotel.
- Jangan pernah menampilkan stack trace atau pesan error teknis mentah kepada tamu.

Aturan komunikasi & pemesanan:
- Gunakan bahasa Indonesia yang ramah, hangat, sopan, dan ringkas.
- Selalu gunakan tools yang tersedia jika tamu menanyakan kamar, ingin memesan kamar, ingin mengganti email reservasi, atau menanyakan rute menuju hotel.
- Untuk memesan kamar (create_booking), kamu WAJIB mengumpulkan 5 data utama dari tamu terlebih dahulu: Nama Lengkap, Alamat Email aktif (penting untuk akses menu "Reservasi saya" & pengiriman konfirmasi), Nomor HP/WhatsApp, Tipe Kamar, serta Tanggal Check-in & Check-out. Jangan pernah mengarang alamat email tamu.
- Setelah booking berhasil dibuat, jelaskan bahwa status pemesanan saat ini MENUNGGU PEMBAYARAN dan tamu harus menyelesaikan pembayaran melalui tombol/halaman pembayaran atau menu "Reservasi saya". Cek juga nilai emailSent dari hasil tool: jika true, beri tahu bahwa detail tagihan sudah dikirim ke email tamu; jika false, beri tahu bahwa pesanan sudah tersimpan di menu "Reservasi saya".
- Jika tamu meminta mengubah email pada booking yang sudah dibuat, panggil tool update_booking_email menggunakan kode booking dan alamat email barunya.`;

const TOOLS_DECLARATION = [
  {
    functionDeclarations: [
      {
        name: "get_available_rooms",
        description:
          "Mengambil daftar tipe kamar yang tersedia di Nestra Hotel beserta harga per malam, kapasitas tamu, dan fasilitas.",
        parameters: {
          type: "OBJECT",
          properties: {
            guests: {
              type: "INTEGER",
              description: "Jumlah tamu yang akan menginap (opsional)",
            },
          },
        },
      },
      {
        name: "create_booking",
        description:
          "Membuat reservasi/pemesanan kamar baru dengan status menunggu pembayaran (PENDING) di database Nestra Hotel.",
        parameters: {
          type: "OBJECT",
          properties: {
            guestName: {
              type: "STRING",
              description: "Nama lengkap tamu",
            },
            guestEmail: {
              type: "STRING",
              description:
                "Alamat email aktif tamu untuk pengiriman konfirmasi & akses menu Reservasi saya",
            },
            guestPhone: {
              type: "STRING",
              description: "Nomor telepon atau WhatsApp tamu",
            },
            roomTypeName: {
              type: "STRING",
              description:
                "Nama tipe kamar yang dipilih (misal: Superior, Deluks, Family Suite)",
            },
            checkIn: {
              type: "STRING",
              description: "Tanggal check-in dalam format YYYY-MM-DD",
            },
            checkOut: {
              type: "STRING",
              description: "Tanggal check-out dalam format YYYY-MM-DD",
            },
            guests: {
              type: "INTEGER",
              description: "Jumlah tamu dewasa",
            },
          },
          required: [
            "guestName",
            "guestEmail",
            "guestPhone",
            "roomTypeName",
            "checkIn",
            "checkOut",
          ],
        },
      },
      {
        name: "update_booking_email",
        description:
          "Memperbarui alamat email pada reservasi yang sudah ada berdasarkan kode booking dan mengirim ulang email konfirmasi ke alamat email baru.",
        parameters: {
          type: "OBJECT",
          properties: {
            bookingCode: {
              type: "STRING",
              description: "Kode booking reservasi (contoh: NST-261119-1234)",
            },
            newEmail: {
              type: "STRING",
              description: "Alamat email baru yang diminta tamu",
            },
          },
          required: ["bookingCode", "newEmail"],
        },
      },
      {
        name: "get_route_to_hotel",
        description:
          "Memberikan estimasi jarak, waktu tempuh, dan tautan Google Maps dari titik keberangkatan tamu menuju Nestra Hotel (Jl. Mangkubumi No. 28, Yogyakarta).",
        parameters: {
          type: "OBJECT",
          properties: {
            origin: {
              type: "STRING",
              description:
                "Lokasi awal/keberangkatan tamu (contoh: Malioboro, Stasiun Tugu, Bandara YIA)",
            },
          },
          required: ["origin"],
        },
      },
    ],
  },
];

function postJsonIpv4(
  url: string,
  bodyObj: any
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(bodyObj);
    const req = https.request(
      url,
      {
        method: "POST",
        family: 4,
        timeout: 45000,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode || 500, text: data })
        );
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Request timeout ke server AI"));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function callGeminiExpress(
  apiKey: string,
  contents: any[],
  systemInstruction: string
) {
  const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];
  let lastError = "";
  let lastStatus = 500;

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await postJsonIpv4(endpoint, {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        tools: TOOLS_DECLARATION,
      });

      if (res.status >= 200 && res.status < 300) {
        return JSON.parse(res.text);
      }

      lastStatus = res.status;
      lastError = res.text;

      if (res.status !== 503 && res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  const err: any = new Error(lastError);
  err.status = lastStatus;
  throw err;
}

async function executeFunctionCall(name: string, args: any) {
  if (name === "get_available_rooms") {
    const rooms = await prisma.room.findMany({
      orderBy: { basePrice: "asc" },
    });

    const formattedRooms = rooms.map((room: any) => ({
      id: room.id,
      slug: room.slug,
      name: room.name,
      tagline: room.description || "Kamar nyaman dengan nuansa khas Yogyakarta",
      pricePerNight: room.basePrice,
      capacity: room.maxGuests || 2,
      totalUnits: room.totalUnits ?? 5,
      imageUrl:
        Array.isArray(room.images) && room.images.length > 0
          ? room.images[0]
          : "/images/room-default.jpg",
    }));

    return {
      result: { rooms: formattedRooms },
      uiPayload: { type: "rooms", rooms: formattedRooms },
    };
  }

  if (name === "create_booking") {
    const {
      guestName,
      guestEmail,
      guestPhone,
      roomTypeName,
      checkIn,
      checkOut,
      guests = 2,
    } = args;

    const cleanEmail = String(guestEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return {
        result: {
          success: false,
          message:
            "Alamat email tamu wajib diisi dengan format yang valid agar pesanan masuk ke menu Reservasi saya.",
        },
      };
    }

    const room = await prisma.room.findFirst({
      where: {
        name: {
          contains: roomTypeName,
          mode: "insensitive",
        },
      },
    });

    if (!room) {
      return {
        result: {
          success: false,
          message: `Tipe kamar "${roomTypeName}" tidak ditemukan. Silakan cek tipe kamar yang tersedia.`,
        },
      };
    }

    const nameParts = String(guestName).trim().split(/\s+/);
    const guestFirstName = nameParts[0] || "Tamu";
    const guestLastName = nameParts.slice(1).join(" ") || "-";

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const roomSubtotal = room.basePrice * nights;
    const taxAmount = Math.round(roomSubtotal * 0.11);
    const totalAmount = roomSubtotal + taxAmount;

    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `NST-${datePart}-${randomPart}`;

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        roomId: room.id,
        guestFirstName,
        guestLastName,
        guestEmail: cleanEmail,
        guestPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        adults: Number(guests),
        roomSubtotal,
        discountAmount: 0,
        taxAmount,
        totalAmount,
        status: "UPCOMING",
        paymentStatus: "PENDING",
        paymentMethod: null,
        paymentRef: null,
        paidAt: null,
      },
    });

    const fullGuestName = `${booking.guestFirstName} ${
      booking.guestLastName === "-" ? "" : booking.guestLastName
    }`.trim();

    let emailSent = false;
    try {
      const mailRes = await sendBookingConfirmationEmail({
        to: cleanEmail,
        guestName: fullGuestName,
        bookingCode: booking.bookingCode,
        roomName: room.name,
        checkIn,
        checkOut,
        nights,
        guests: Number(guests),
        totalAmount: booking.totalAmount,
      });
      emailSent = mailRes.sent;
    } catch (mailErr) {
      console.error("Gagal mengirim email konfirmasi booking:", mailErr);
    }

    const bookingSummary = {
      bookingCode: booking.bookingCode,
      guestName: fullGuestName,
      guestEmail: cleanEmail,
      roomName: room.name,
      checkIn,
      checkOut,
      nights,
      totalPrice: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentUrl: `/reservasi/pembayaran?code=${booking.bookingCode}`,
      emailSent,
    };

    return {
      result: { success: true, booking: bookingSummary },
      uiPayload: { type: "booking", booking: bookingSummary },
    };
  }

  if (name === "update_booking_email") {
    const cleanCode = String(args.bookingCode || "").trim().toUpperCase();
    const cleanEmail = String(args.newEmail || "").trim().toLowerCase();

    if (!cleanEmail.includes("@")) {
      return {
        result: {
          success: false,
          message: "Format alamat email baru tidak valid.",
        },
      };
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { bookingCode: cleanCode },
      include: { room: true },
    });

    if (!existingBooking) {
      return {
        result: {
          success: false,
          message: `Kode booking ${cleanCode} tidak ditemukan di sistem.`,
        },
      };
    }

    const updated = await prisma.booking.update({
      where: { bookingCode: cleanCode },
      data: { guestEmail: cleanEmail },
    });

    const fullGuestName = `${updated.guestFirstName} ${
      updated.guestLastName === "-" ? "" : updated.guestLastName
    }`.trim();

    let emailSent = false;
    try {
      const mailRes = await sendBookingConfirmationEmail({
        to: cleanEmail,
        guestName: fullGuestName,
        bookingCode: updated.bookingCode,
        roomName: existingBooking.room.name,
        checkIn: updated.checkIn.toISOString().slice(0, 10),
        checkOut: updated.checkOut.toISOString().slice(0, 10),
        nights: updated.nights,
        guests: updated.adults,
        totalAmount: updated.totalAmount,
      });
      emailSent = mailRes.sent;
    } catch (mailErr) {
      console.error("Gagal mengirim ulang email konfirmasi:", mailErr);
    }

    return {
      result: {
        success: true,
        bookingCode: updated.bookingCode,
        newEmail: cleanEmail,
        emailSent,
        message:
          "Email reservasi berhasil diperbarui di database sehingga pesanan tampil di menu Reservasi saya.",
      },
      uiPayload: {
        type: "email_updated",
        newEmail: cleanEmail,
      },
    };
  }

  if (name === "get_route_to_hotel") {
    const origin = args.origin || "Malioboro Yogyakarta";
    const destination =
      "Jl. Mangkubumi No. 28, Gowongan, Jetis, Yogyakarta 55232";
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}`;

    const routeData = {
      origin,
      destination,
      estimatedTime: origin.toLowerCase().includes("malioboro")
        ? "5–8 menit (sekitar 1,2 km)"
        : origin.toLowerCase().includes("tugu")
        ? "4–6 menit (sekitar 850 m)"
        : "15–45 menit tergantung lalu lintas",
      mapsUrl,
    };

    return {
      result: routeData,
      uiPayload: { type: "route", route: routeData },
    };
  }

  return { result: { error: "Fungsi tidak dikenali" } };
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "Maaf, layanan asisten Nia sedang dalam pemeliharaan sementara. Silakan hubungi resepsionis kami di +62 274 582 100.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const contents = messages
      .map((msg: any) => ({
        role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
        parts: [{ text: String(msg.content ?? msg.text ?? "").trim() }],
      }))
      .filter((item: any) => item.parts[0].text.length > 0)
      .slice(-10);

    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    if (
      contents.length === 0 &&
      typeof body.message === "string" &&
      body.message.trim()
    ) {
      contents.push({
        role: "user",
        parts: [{ text: body.message.trim() }],
      });
    }

    let data = await callGeminiExpress(apiKey, contents, SYSTEM_INSTRUCTION);
    let candidate = data.candidates?.[0]?.content;
    let uiData: any = null;

    const functionCallPart = candidate?.parts?.find((p: any) => p.functionCall);

    if (functionCallPart?.functionCall) {
      const { name, args } = functionCallPart.functionCall;
      const execResult = await executeFunctionCall(name, args);
      uiData = execResult.uiPayload || null;

      const followUpContents = [
        ...contents,
        candidate,
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name,
                response: execResult.result,
              },
            },
          ],
        },
      ];

      data = await callGeminiExpress(apiKey, followUpContents, SYSTEM_INSTRUCTION);
      candidate = data.candidates?.[0]?.content;
    }

    const replyText =
      candidate?.parts?.map((p: any) => p.text || "").join("") ||
      "Maaf, Nia sedang mengalami kendala memproses jawaban.";

    return NextResponse.json({
      reply: replyText,
      uiData,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    if (error?.status === 503 || error?.status === 429) {
      return NextResponse.json(
        {
          reply:
            "Maaf, asisten Nia sedang melayani banyak tamu saat ini. Silakan kirim ulang pesan Anda beberapa detik lagi ya.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        reply:
          "Maaf, asisten Nia sedang mengalami kendala teknis sementara. Silakan coba beberapa saat lagi atau hubungi resepsionis kami di +62 274 582 100.",
      },
      { status: 500 }
    );
  }
}