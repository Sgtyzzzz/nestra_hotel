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

      // Cek otomatis apakah Gmail yang login terdaftar di tabel Admin PostgreSQL
      const allowedAdmin = await prisma.admin.findUnique({
        where: { email: user.email.toLowerCase() },
      });

      if (!allowedAdmin) {
        // Tolak jika bukan email admin terdaftar
        return "/admin/login?error=AccessDenied";
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const adminData = await prisma.admin.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (adminData) {
          token.role = adminData.role;
          token.adminId = adminData.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };