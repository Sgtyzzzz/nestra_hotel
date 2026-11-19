import { prisma } from "@/lib/prisma";

export async function isEmailTakenAcrossRoles(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();

  const [existingGuest, existingStaffOrAdmin] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.admin.findUnique({ where: { email } }),
  ]);

  if (existingGuest) {
    return {
      taken: true,
      role: existingGuest.role || "GUEST",
      message: "Email ini sudah terdaftar sebagai akun tamu (Customer).",
    };
  }

  if (existingStaffOrAdmin) {
    return {
      taken: true,
      role: existingStaffOrAdmin.role,
      message: `Email ini sudah terdaftar sebagai akun internal (${existingStaffOrAdmin.role}).`,
    };
  }

  return { taken: false, role: null, message: null };
}

export async function assertEmailUniqueAcrossSystem(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const check = await isEmailTakenAcrossRoles(email);

  if (check.taken) {
    throw new Error(
      check.message ||
        "Email sudah digunakan oleh akun lain di sistem (Customer, Staff, atau Admin)."
    );
  }

  return email;
}