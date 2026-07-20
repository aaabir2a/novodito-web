"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import WalletPill from "@/components/system/WalletPill";
import NotificationBell from "@/components/system/NotificationBell";

// Rail = final IA (UX_UI_PLAN §3); the rest live in the mobile menu + footer.
const RAIL: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/rankings", label: "Rankings" },
  { href: "/matches", label: "Matches" },
  { href: "/live", label: "Live" },
  { href: "/clubs", label: "Clubs" },
  { href: "/community", label: "Community" },
  { href: "/shorts", label: "Shorts" },
  { href: "/shop", label: "Shop" },
];

const MENU: { href: string; icon: string; label: string }[] = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/tournaments", icon: "🏆", label: "Tournaments" },
  { href: "/rankings", icon: "📊", label: "Rankings" },
  { href: "/matches", icon: "⚽", label: "Matches" },
  { href: "/live", icon: "📡", label: "Live" },
  { href: "/community", icon: "🌍", label: "Community" },
  { href: "/fixtures", icon: "📅", label: "Fixtures" },
  { href: "/news", icon: "📰", label: "News" },
  { href: "/shop", icon: "🛒", label: "Shop" },
  { href: "/clubs", icon: "🛡️", label: "Clubs" },
  { href: "/gallery", icon: "📸", label: "Gallery" },
  { href: "/shorts", icon: "🎬", label: "Shorts" },
  { href: "/wallet", icon: "🪙", label: "Wallet" },
  { href: "/studio", icon: "🎨", label: "Card Studio" },
  { href: "/wars", icon: "⚔️", label: "Club Wars" },
  { href: "/coming-soon", icon: "🚀", label: "Coming Soon" },
  { href: "/register", icon: "📝", label: "Register" },
  { href: "/sponsorship", icon: "🤝", label: "Sponsors" },
  { href: "/about", icon: "ℹ️", label: "About" },
  { href: "/contact", icon: "📞", label: "Contact" },
];

const LANGS = [
  { code: "en", label: "EN" },
  { code: "bn", label: "বাং" },
  { code: "jp", label: "日" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll while mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav id="hud-nav" className={scrolled ? "sc" : ""}>
        <div className="hn-frame" aria-hidden />

        <Link className="hn-logo" href="/">
          <span className="hn-hex">
            <Image
              src="/logo.svg"
              alt="eBattleVerse logo"
              width={32}
              height={32}
              priority
              unoptimized
            />
          </span>
          <span className="hn-word">
            eBATTLE<b>VERSE</b>
          </span>
        </Link>

        <ul className="hn-rail">
          {RAIL.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`hn-link${isActive(item.href) ? " on" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hn-ops">
          <div className="hn-lang">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={`hn-lb${lang === l.code ? " on" : ""}`}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>

          {!loading && user ? (
            <>
              <WalletPill />
              <NotificationBell />
              <Link className="hn-chip lime" href="/profile">
                <span>👤 {user.username}</span>
              </Link>
            </>
          ) : (
            <Link className="hn-chip lime" href="/login">
              <span>👤 Login</span>
            </Link>
          )}
          <Link className="hn-chip desk" href="/clubs/login">
            <span>🛡️ Club</span>
          </Link>
          <Link className="hn-chip ghost desk" href="/admin">
            <span>🔐 Admin</span>
          </Link>

          <button
            className="hn-burger"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div id="mm" className={mobileOpen ? "op" : ""}>
        <button
          className="mc2"
          id="mc2"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        >
          ✕
        </button>
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon} {item.label}
          </Link>
        ))}
        <Link href={user ? "/profile" : "/login"} onClick={() => setMobileOpen(false)}>
          👤 {user ? user.username : "Player Login"}
        </Link>
        <Link href="/clubs/login" onClick={() => setMobileOpen(false)}>
          🛡️ Club Login
        </Link>
        <Link href="/admin" onClick={() => setMobileOpen(false)}>
          🔐 Admin
        </Link>
      </div>
    </>
  );
}
