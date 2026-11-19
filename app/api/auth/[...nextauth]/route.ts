import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.trim().toLowerCase();

      const [existingGuest, internalAccount] = await Promise.all([
        prisma.user.findUnique({ where: { email } }),
        prisma.admin.findUnique({ where: { email } }),
      ]);

      // 1. Cegah bentrok: jika email sudah terdaftar sebagai customer di tabel User,
      // tolak akses ke portal internal (STAFF / ADMIN)
      if (existingGuest) {
        return "/admin/login?error=RoleConflict";
      }

      // 2. Hanya izinkan email yang terdaftar di tabel Admin (dengan role STAFF atau ADMIN)
      if (!internalAccount) {
        return "/admin/login?error=AccessDenied";
      }

      const normalizedRole = internalAccount.role.toUpperCase();
      if (normalizedRole !== "ADMIN" && normalizedRole !== "STAFF") {
        return "/admin/login?error=AccessDenied";
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const email = user.email.trim().toLowerCase();
        const adminData = await prisma.admin.findUnique({
          where: { email },
        });
        if (adminData) {
          token.role = adminData.role.toUpperCase(); // "STAFF" atau "ADMIN"
          token.adminId = adminData.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; adminId?: string }).role =
          token.role as string;
        (session.user as { role?: string; adminId?: string }).adminId =
          token.adminId as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };