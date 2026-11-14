import type {Metadata} from "next";
import {Playfair_Display,Plus_Jakarta_Sans} from "next/font/google";
import "./globals.css";

const Playfair = Playfair_Display({
  subsets: ["latin"],
  variable :"--font-serif",
});

const jakarta =Plus_Jakarta_Sans ({
  subsets:["latin"],
  variable : "--font-serif",
});

export const metadata:Metadata ={
  title :"Nestra Hotel | Your Stay, Made Simple",
  description:"singgah dengan tenang,jelajahi dengan leluasa"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${Playfair.variable} ${jakarta.variable}`}>
      <body className="font-sans bg-white text-[#1A202C] antialiased">
        {children}
      </body>
    </html>
  );
}
  