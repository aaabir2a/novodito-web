"use client";

// REQ-55 — platform assistant bubble (UI shell). The answer engine is a RAG
// console wired separately; until it lands, the panel greets, explains what
// it will do, and offers the WhatsApp handoff. Available on every page.

import { useEffect, useRef, useState } from "react";

export default function ChatbotBubble() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={rootRef}>
      <button
        className="eb-bot-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Platform assistant"
      >
        {/* mini emblem: hex + bolt, matches the brand logo */}
        <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden>
          <polygon points="32,6 55,19 55,45 32,58 9,45 9,19" fill="#05010F" stroke="#39D353" strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points="37,14 24,34 31,34 27,50 41,29 33,29" fill="#FFC81E" stroke="#FFB800" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="eb-bot-panel" role="dialog" aria-label="Platform assistant">
          <div className="eb-bot-head">
            <span className="eb-livedot" aria-hidden /> VERSE ASSISTANT
            <button className="x" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="eb-bot-body">
            <p className="hi">👋 Salam! I&apos;m the eBattleVerse assistant.</p>
            <p>
              Soon I&apos;ll answer in <b>English</b>, <b>বাংলা</b> and <b>日本語</b> —
              your rank, next match, tournament rules, coin balances, all live.
            </p>
            <p className="dim">The answer engine is being connected. Meanwhile, a human can help:</p>
            <a className="btn btn-lm btn-sm" href="https://wa.me/8801700000000" target="_blank" rel="noreferrer">
              💬 WhatsApp Admin
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
