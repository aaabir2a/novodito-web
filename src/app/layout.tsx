import type { Metadata } from "next";
import { Bebas_Neue, Rajdhani, Orbitron } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroMotion from "@/components/HeroMotion";
import CustomCursor from "@/components/CustomCursor";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";
import ChatbotBubble from "@/components/system/ChatbotBubble";

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
  metadataBase: new URL("https://ebattleverse.com"),
  title: {
    default: "eBattleVerse — Official eFootball Hub 2026",
    template: "%s · eBattleVerse",
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
    "eBattleVerse",
  ],
  openGraph: {
    type: "website",
    title: "eBattleVerse — Official eFootball Hub 2026",
    description:
      "Bangladesh's premier eFootball tournament organizer. LAN tournaments, live streams, global rankings.",
    siteName: "eBattleVerse",
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
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <div id="main">{children}</div>
            <Footer />
            <HeroMotion />
            <CustomCursor />
            <ChatbotBubble />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
