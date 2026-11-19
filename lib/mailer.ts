import nodemailer from "nodemailer";

export interface BookingEmailPayload {
  to: string;
  guestName: string;
  bookingCode: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
}

export async function sendBookingConfirmationEmail(data: BookingEmailPayload) {
  const user = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("SMTP_EMAIL atau SMTP_APP_PASSWORD belum diatur, email dilewati.");
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(data.totalAmount);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #111827; color: #ffffff; padding: 24px;">
        <h2 style="margin: 0; letter-spacing: 1px;">NESTRA HOTEL YOGYAKARTA</h2>
        <p style="margin: 6px 0 0; color: #d1d5db; font-size: 13px;">Jl. Mangkubumi No. 28, Gowongan, Jetis, Yogyakarta 55232</p>
      </div>
      <div style="padding: 24px; color: #1f2937;">
        <p>Halo <strong>${data.guestName}</strong>,</p>
        <p>Terima kasih telah melakukan reservasi melalui AI Concierge <strong>Nia</strong>. Berikut adalah detail konfirmasi pemesanan kamar Anda:</p>
        
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Kode Booking:</strong> <span style="font-size: 16px; color: #111827;">${data.bookingCode}</span></p>
          <p style="margin: 0 0 8px;"><strong>Tipe Kamar:</strong> ${data.roomName}</p>
          <p style="margin: 0 0 8px;"><strong>Check-in:</strong> ${data.checkIn} (mulai 14:00 WIB)</p>
          <p style="margin: 0 0 8px;"><strong>Check-out:</strong> ${data.checkOut} (maksimal 12:00 WIB)</p>
          <p style="margin: 0 0 8px;"><strong>Durasi & Tamu:</strong> ${data.nights} malam • ${data.guests} tamu</p>
          <p style="margin: 0;"><strong>Total Biaya (termasuk pajak 11%):</strong> <strong>${formattedTotal}</strong></p>
        </div>

        <p style="font-size: 14px; color: #4b5563;">Anda dapat melihat dan mengelola pesanan ini kapan saja melalui menu <strong>Reservasi Saya</strong> menggunakan alamat email <strong>${data.to}</strong>.</p>
        
        <div style="margin-top: 24px;">
          <a href="${appUrl}/reservasi-saya" style="background-color: #111827; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-size: 14px; display: inline-block;">Lihat Reservasi Saya</a>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Nestra Hotel Yogyakarta" <${user}>`,
    to: data.to,
    subject: `Konfirmasi Reservasi Nestra Hotel — ${data.bookingCode}`,
    html,
  });

  return { sent: true };
}