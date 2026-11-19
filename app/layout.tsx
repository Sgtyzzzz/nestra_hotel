import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import PublicNavbar from "@/components/PublicNavbar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Nestra Hotel | Your Stay, Made Simple.",
  description:
    "Ruang nyaman, keramahan tulus, dan Yogyakarta yang selalu dekat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${playfair.variable}`}>
      <body className="antialiased bg-[#FAF7F2] text-[#0F2334]">
        <style>{`
          body:has(header[data-global-navbar="true"]) header:not([data-global-navbar="true"]) {
            display: none !important;
          }
        `}</style>
        <Suspense fallback={null}>
          <PublicNavbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}