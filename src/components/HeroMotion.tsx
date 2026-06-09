"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Pauses the hero's infinite animations whenever the hero is scrolled out of view.
// Pure enhancement: if IntersectionObserver never fires (headless, no-JS), the
// animations simply keep running — nothing breaks.
export default function HeroMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    if (!hero || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      ([entry]) => hero.classList.toggle("motion-off", !entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
