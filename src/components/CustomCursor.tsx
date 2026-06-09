"use client";

import { useEffect, useState } from "react";

// Custom trailing cursor from the original site: an instant dot (#cd), a lerped
// ring (#cr), and a slower glow (#cg). Only on hover-capable, fine-pointer devices
// (skips touch). Adds `cursor-custom` to <html> so CSS can hide the native cursor.
const HOVER_SELECTOR =
  "a,button,.tc,.nc,.gi,.rg-s,.ci,.sc-b,.lb,.ab,.btn,.glass,.ev3d-card,.ev3d-cta,.shop3d-card,.shop3d-btn,.ntp-card,.qstat-item";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  // 1) Decide whether to enable (touch devices keep the native cursor).
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setEnabled(true);
    }
  }, []);

  // 2) Wire up movement only after the cursor elements are in the DOM.
  useEffect(() => {
    if (!enabled) return;

    const cd = document.getElementById("cd");
    const cr = document.getElementById("cr");
    const cg = document.getElementById("cg");
    if (!cd || !cr || !cg) return;

    const root = document.documentElement;
    root.classList.add("cursor-custom");

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2,
      rx = mx,
      ry = my,
      gx = mx,
      gy = my,
      raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(HOVER_SELECTOR))
        document.body.classList.add("ch");
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(HOVER_SELECTOR))
        document.body.classList.remove("ch");
    };

    const loop = () => {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      gx += (mx - gx) * 0.06;
      gy += (my - gy) * 0.06;
      cd.style.left = mx + "px";
      cd.style.top = my + "px";
      cr.style.left = rx + "px";
      cr.style.top = ry + "px";
      cg.style.left = gx + "px";
      cg.style.top = gy + "px";
      raf = requestAnimationFrame(loop);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      root.classList.remove("cursor-custom");
      document.body.classList.remove("ch");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div id="cg" />
      <div id="cr" />
      <div id="cd" />
    </>
  );
}
