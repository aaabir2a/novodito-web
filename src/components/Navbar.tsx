"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV: { href: string; icon: string; label: string }[] = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/tournaments", icon: "🏆", label: "Tournaments" },
  { href: "/rankings", icon: "📊", label: "Rankings" },
  { href: "/matches", icon: "⚽", label: "Matches" },
  { href: "/news", icon: "📰", label: "News" },
  { href: "/shop", icon: "🛒", label: "Shop" },
  { href: "/gallery", icon: "📸", label: "Gallery" },
  { href: "/clubs", icon: "🛡️", label: "Clubs" },
  { href: "/fixtures", icon: "📅", label: "Fixtures" },
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
      <nav id="nb" className={scrolled ? "sc" : ""}>
        <Link className="nl" href="/">
          <div className="nl-iw">
            <Image
              id="n-lg"
              src="/img/n-lg.jpg"
              alt="Nobodito Gaming logo"
              width={44}
              height={44}
              priority
            />
          </div>
          <div className="nl-t">
            NOBODITO <span className="ac">GAMING</span>
          </div>
        </Link>

        <ul className="nls">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                data-pg={item.label.toLowerCase()}
                className={isActive(item.href) ? "on" : ""}
              >
                <span className="ni">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nr">
          <div className="nlng">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={`lb${lang === l.code ? " on" : ""}`}
                data-lg={l.code}
                onClick={() => setLang(l.code)}
              >
                <span>{l.label}</span>
              </button>
            ))}
          </div>
          {!loading && user ? (
            <Link
              className="ab"
              href="/profile"
              style={{ borderColor: "rgba(0,255,127,.35)", color: "var(--lm-green,#00FF7F)" }}
            >
              <span>👤 {user.username}</span>
            </Link>
          ) : (
            <Link className="ab" href="/login">
              <span>👤 Player Login</span>
            </Link>
          )}
          <Link
            className="ab"
            href="/clubs/login"
            style={{ borderColor: "rgba(255,184,0,.3)", color: "var(--gold)" }}
          >
            <span>🛡️ Club</span>
          </Link>
          <Link className="ab" href="/admin">
            <span>🔐 Admin</span>
          </Link>
        </div>

        <button
          className="hb"
          id="hb"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
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
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
