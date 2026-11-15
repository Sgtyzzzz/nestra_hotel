import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const body = await request.json();

  const updated = await prisma.booking.update({
    where: { bookingCode: code },
    data: {
      status: body.status || "COMPLETED",
      paymentStatus: body.paymentStatus || "PAID",
    },
  });

  return NextResponse.json(updated);
}