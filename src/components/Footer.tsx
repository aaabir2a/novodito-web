import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer id="site-footer">
      <div className="ft-in">
        <div className="ft-g">
          <div className="ft-brand">
            <div className="ft-logo">
              <Image
                id="ft-lg"
                src="/logo.svg"
                alt="eBattleVerse"
                width={48}
                height={48}
                unoptimized
              />
              <div className="ft-logo-t">
                eBATTLE<span>VERSE</span>
              </div>
            </div>
            <p>
              Bangladesh&apos;s official eFootball tournament organizer. Official
              Konami partner building the future of competitive gaming in
              Bangladesh.
            </p>
            <div className="sc-r" style={{ marginTop: "1rem" }}>
              <a className="sc-b" href="#">
                ▶
              </a>
              <a className="sc-b" href="#">
                f
              </a>
              <a className="sc-b" href="#">
                ◎
              </a>
              <a className="sc-b" href="#">
                ⌘
              </a>
            </div>
          </div>

          <div>
            <div className="fth4">TOURNAMENTS</div>
            <ul className="ftul">
              <li>
                <Link href="/tournaments">Bangladesh Open 2026</Link>
              </li>
              <li>
                <Link href="/tournaments">Summer Championship</Link>
              </li>
              <li>
                <Link href="/tournaments">Pro League Season 3</Link>
              </li>
              <li>
                <Link href="/tournaments">National Cup 2026</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="fth4">COMMUNITY</div>
            <ul className="ftul">
              <li>
                <Link href="/rankings">Rankings</Link>
              </li>
              <li>
                <Link href="/matches">Matches</Link>
              </li>
              <li>
                <Link href="/news">News</Link>
              </li>
              <li>
                <Link href="/shop">Shop</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="fth4">INFO</div>
            <ul className="ftul">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/sponsorship">Sponsorship</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/admin">Admin</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="ft-bot">
          <div className="ft-cp">
            © 2026 <span>eBattleVerse</span>. All rights reserved. Official
            Konami eFootball Partner. eBattleVerse.com
          </div>
          <div className="ft-lks">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
