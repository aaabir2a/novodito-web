// Mock data layer. Swap these arrays for real API calls (lib/api.ts) later —
// the page components only import from here, so the backend wiring is one file.

export type EventTheme = "gold" | "lime" | "cyan" | "purple" | "red" | "orange";

export interface EventItem {
  id: number;
  name: string;
  date: string;
  prize: string;
  players: string;
  location: string;
  emoji: string;
  status: string;
  type: "upcoming" | "live";
  theme: EventTheme;
  img?: string;
}

export interface ShopItem {
  id: number;
  name: string;
  cat: string;
  desc: string;
  price: number;
  sale: number | null;
  stock: number;
  emoji: string;
  status: "active" | "out" | "hidden";
}

export interface Player {
  id: number;
  name: string;
  tier: "PRO" | "ELITE" | "RISING" | "";
  club?: string;
  wins: number;
  losses: number;
  goals: number;
  matches: number;
  online: boolean;
  joined?: string;
}

export const themeColor: Record<EventTheme, string> = {
  gold: "rgba(255,208,0,.9)",
  lime: "rgba(0,255,127,.9)",
  cyan: "rgba(0,229,255,.9)",
  purple: "rgba(191,95,255,.9)",
  red: "rgba(255,34,68,.9)",
  orange: "rgba(255,102,0,.9)",
};

export const themeGlow: Record<EventTheme, string> = {
  gold: "rgba(255,184,0,.15)",
  lime: "rgba(0,255,127,.12)",
  cyan: "rgba(0,229,255,.12)",
  purple: "rgba(191,95,255,.14)",
  red: "rgba(255,34,68,.12)",
  orange: "rgba(255,102,0,.12)",
};

export const SHOP_THEME_CYCLE = ["sc-gold", "sc-lime", "sc-cyan", "sc-purple"];

export const events: EventItem[] = [
  { id: 1001, name: "Bangladesh Open 2026", date: "April 12, 2026", prize: "৳70,000", players: "128", location: "Mirpur Indoor Stadium", emoji: "🏆", status: "Reg. Open", type: "upcoming", theme: "gold" },
  { id: 1002, name: "Summer Championship 2026", date: "July 2026", prize: "৳1,00,000", players: "128+25", location: "Dhaka", emoji: "⚡", status: "Reg. Open", type: "upcoming", theme: "lime" },
  { id: 1003, name: "National Cup 2026", date: "August 2026", prize: "৳2,00,000", players: "256", location: "Mirpur Stadium", emoji: "🥇", status: "Reg. Open", type: "upcoming", theme: "cyan" },
  { id: 1004, name: "Dhaka City Cup 2026", date: "May 2026", prize: "৳30,000", players: "64", location: "Dhaka", emoji: "🌐", status: "Reg. Open", type: "upcoming", theme: "purple" },
  { id: 1005, name: "Pro League Season 3", date: "September 2026", prize: "৳3,00,000", players: "Top 32", location: "Dhaka", emoji: "⭐", status: "Reg. Open", type: "upcoming", theme: "gold" },
  { id: 1006, name: "Chittagong Regional 2026", date: "June 2026", prize: "৳25,000", players: "64", location: "Chittagong", emoji: "🎮", status: "Reg. Open", type: "upcoming", theme: "red" },
];

export const shopItems: ShopItem[] = [
  { id: 1, name: "Official Player Jersey 2026", cat: "jersey", desc: "Premium quality jersey worn by official tournament players. Available in all sizes.", price: 1200, sale: null, stock: 50, emoji: "👕", status: "active" },
  { id: 2, name: "Nobodito Gaming Cap", cat: "merch", desc: "Classic snapback cap with embroidered Nobodito Gaming logo.", price: 550, sale: 450, stock: 35, emoji: "🧢", status: "active" },
  { id: 3, name: "eFootball Sticker Pack", cat: "collectible", desc: "10 high-quality vinyl stickers featuring tournament winners and logos.", price: 150, sale: null, stock: 200, emoji: "✨", status: "active" },
  { id: 4, name: "Tournament Wristband", cat: "accessory", desc: "Official tournament wristband worn by players and staff.", price: 80, sale: null, stock: 150, emoji: "📿", status: "active" },
  { id: 5, name: "Champion Trophy Miniature", cat: "collectible", desc: "Miniature replica of the Nobodito Gaming Champion Trophy.", price: 2500, sale: 2200, stock: 20, emoji: "🏆", status: "active" },
  { id: 6, name: "Gaming Mousepad XL", cat: "accessory", desc: "Extra-large gaming mousepad with Nobodito Gaming design.", price: 800, sale: null, stock: 40, emoji: "🖱️", status: "active" },
  { id: 7, name: "Nobodito Hoodie", cat: "merch", desc: "Premium fleece hoodie with full-back print logo.", price: 1800, sale: null, stock: 25, emoji: "🧥", status: "active" },
  { id: 8, name: "eFootball 2026 Yearbook", cat: "collectible", desc: "Official printed yearbook documenting the 2026 season.", price: 350, sale: null, stock: 0, emoji: "📕", status: "out" },
];

export const players: Player[] = [
  { id: 1, name: "RafsanPro", tier: "PRO", club: "Dhaka Titans", wins: 48, losses: 6, goals: 192, matches: 58, online: true, joined: "Joined 04 Jan 2026" },
  { id: 2, name: "ShakibGG", tier: "PRO", club: "Mirpur Kings", wins: 44, losses: 9, goals: 176, matches: 56, online: true, joined: "Joined 09 Jan 2026" },
  { id: 3, name: "TanvirX", tier: "ELITE", club: "Chittagong FC", wins: 39, losses: 11, goals: 151, matches: 52, online: false, joined: "Joined 15 Jan 2026" },
  { id: 4, name: "NafisAce", tier: "ELITE", wins: 35, losses: 13, goals: 138, matches: 50, online: true, joined: "Joined 21 Jan 2026" },
  { id: 5, name: "ZayanFC", tier: "RISING", club: "Sylhet Stars", wins: 28, losses: 16, goals: 109, matches: 46, online: false, joined: "Joined 02 Feb 2026" },
  { id: 6, name: "ArnobK", tier: "RISING", wins: 24, losses: 18, goals: 94, matches: 44, online: true, joined: "Joined 11 Feb 2026" },
];

export const tickerItems = [
  "Nobodito Bangladesh Open 2026 — Registration Open",
  "eFootball Summer Championship 2026 — Coming July",
  "Pro League Season 3 — Nominations Opening Soon",
  "RafsanPro leads 2026 national rankings — 4,820 pts",
  "National Cup 2026 — Mirpur Indoor Stadium — August",
  "Official Konami Partner 2026 — Bangladesh Certified",
];
