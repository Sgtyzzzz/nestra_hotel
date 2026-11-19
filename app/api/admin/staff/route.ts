import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { assertEmailUniqueAcrossSystem } from "@/lib/check-unique-email";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session || role !== "ADMIN") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya ADMIN yang dapat melihat daftar staf." },
        { status: 403 }
      );
    }

    const staffList = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: staffList });
  } catch (error) {
    console.error("GET /api/admin/staff error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar staf" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!session || role !== "ADMIN") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya ADMIN yang dapat mendaftarkan staf." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, role: targetRole = "STAFF" } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email dan nama wajib diisi" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    const normalizedRole = String(targetRole).toUpperCase();
    if (normalizedRole !== "STAFF" && normalizedRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Role harus bernilai STAFF atau ADMIN" },
        { status: 400 }
      );
    }

    // Cek agar email tidak sama dengan akun lain (Customer, Staff, maupun Admin)
    const cleanEmail = await assertEmailUniqueAcrossSystem(String(email));

    const created = await prisma.admin.create({
      data: {
        email: cleanEmail,
        name: String(name).trim(),
        role: normalizedRole,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mendaftarkan email staf";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}