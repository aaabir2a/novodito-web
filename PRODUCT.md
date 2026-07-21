# Product

## Register

Brand-first. Public gaming brand site (marketing, tournaments, rankings, news) for **eBattleVerse** (eBattleVerse.com; formerly Nobodito Gaming); design IS the product on public pages. Logo: `public/logo.svg` — hex arena (lime) + orbit ellipse (gold, the "Verse") + strike bolt (gold, the "Battle"); favicon `src/app/icon.svg`. App surfaces (login, register, profile, admin) live inside the same shell and follow the product register, inheriting the brand's visual system at lower intensity.

## Users & Purpose

- Bangladeshi eFootball (Konami) players and fans, mostly mobile-first, gaming-literate, aged roughly 15-30.
- Jobs: discover tournaments, register for the season, follow rankings/matches, buy merch, manage their player profile.
- Emotional target: competitive energy, legitimacy ("official Konami partner"), local pride.

## Brand personality

- Three words: competitive, electric, official.
- Aesthetic lane: **Tactical HUD esports** — angular clipped panels, target brackets, scanline accents, energy lines. Not neon-arcade chaos, not corporate-clean.
- Committed identity (preserve, don't reinvent): deep dark bg `#03000A`, lime `#39D353`/`#00FF7F` + gold `#FFB800` dual accent, fonts Bebas Neue (display) + Rajdhani (body) + Orbitron (labels/HUD).

## Anti-references

- Generic SaaS landing pages (cream bg, card grids, gradient text everywhere).
- Neon-arcade oversaturation: glow on everything reads as noise and costs GPU.
- Corporate esports (dry, sponsor-deck look).

## Accessibility & performance

- Must stay smooth on mid-range Android/older laptops: no layout-property animations, no infinite animations on filtered elements, ambient FX pause offscreen.
- `prefers-reduced-motion`: ambient/infinite FX off, transitions become instant or crossfade.
- Touch devices: native cursor, reduced backdrop-filter (already in place).
- Body text contrast ≥ 4.5:1 against the dark bg.

## Strategic design principles

1. One dominant idea per fold; hero carries the brand, inner pages calm down.
2. Glow is currency: spend it on 1-2 focal elements per view, never on everything.
3. Motion is compositor-only (transform/opacity); paint-heavy effects are static after first render.
4. HUD ornamentation (brackets, notches, scanlines) marks interactive/active state, not decoration for its own sake.
