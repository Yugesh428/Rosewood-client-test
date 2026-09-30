import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import { Inter } from "next/font/google";
import { Cormorant } from "next/font/google";
import { Montserrat } from "next/font/google";
import { Josefin_Sans } from "next/font/google";
import { Cinzel } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const josefinSans = Josefin_Sans({
  variable: "--font-brandon",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rosewood",
  description: "Luxury apothecary & wellness",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${inter.variable} ${cormorant.variable} ${montserrat.variable} ${josefinSans.variable} ${cinzel.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
