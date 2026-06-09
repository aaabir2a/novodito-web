import type { Metadata } from "next";
import { Bebas_Neue, Rajdhani, Orbitron } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nobodito.gg"),
  title: {
    default: "Nobodito Gaming — Official eFootball Hub 2026",
    template: "%s · Nobodito Gaming",
  },
  description:
    "Bangladesh's premier eFootball tournament organizer. Official Konami partner. LAN tournaments, live streams, and global rankings for the 2026 season.",
  keywords: [
    "eFootball",
    "Bangladesh",
    "esports",
    "tournaments",
    "Konami",
    "gaming",
    "Nobodito",
  ],
  openGraph: {
    type: "website",
    title: "Nobodito Gaming — Official eFootball Hub 2026",
    description:
      "Bangladesh's premier eFootball tournament organizer. LAN tournaments, live streams, global rankings.",
    siteName: "Nobodito Gaming",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${rajdhani.variable} ${orbitron.variable}`}
    >
      <body>
        <Navbar />
        <div id="main">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
