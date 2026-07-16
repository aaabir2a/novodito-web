# eBattleVerse Frontend — UX/UI Master Plan

**Scope:** UX/UI only. No code. Derived from backend docs in `eBattleVerse/docs/`:
`clean_requirements_analysis_fixed.md` (FR-001…FR-147, UJ-001…007, UR-001…009),
`requirements_gap_analysis_v2.md` (REQ-40…59), `database_and_api_design_v3.md` (§5 API surface),
`architecture_design_v2.md`, `change_log_v3.md`.
Backend status: v2/v3 implemented, 540/540 tests passing — the API is ahead of the UI. This plan closes that gap.

---

## 1. Experience Principles (gaming-community first)

1. **Identity is the product.** Players come back for their name, rank, streak, badges, and card. Every screen answers "where do I stand?" — profile photo on every leaderboard row (FR-049), gold glow for elite (FR-024), crowns for top 3 (FR-050), self-row highlighting (FR-052).
2. **Live-first.** Match results, queues, streams, and feeds update without refresh. Anything that can change while the user watches shows a live state (WebSocket APIs §5.24). Stale data is a broken promise on a competitive platform.
3. **Low-friction loops.** The core loop — *queue → match → result → points → brag* — must never exceed a few taps. Matchmaking (REQ-40) is one button + live queue counter. Sharing a result is one tap (REQ-59).
4. **Spectacle earns retention.** Winning must *feel* like winning: goal bursts (REQ-51), raid takeovers (REQ-50), highlight clips (REQ-56), animated coin rewards. Spend glow deliberately — celebration moments only, never ambient noise (perf lesson already learned).
5. **Mobile-first Bangladesh.** Primary audience is mobile players on mid-range Android. Every layout designed at 360px first; heavy effects degrade gracefully; bKash is the payment mental model (FR §1.9).
6. **Two currencies, zero confusion.** Battle Coins (competitive) vs S Coins (cosmetic) must be distinguishable at a glance everywhere (REQ-41/44/45) — distinct 3D glowing icons, separate wallet lanes, color-coded transactions.
7. **Trust through transparency.** Score verification states (Pending / Verified / Conflict), payment states (Pending / Approved / Rejected), and contract states are always visible with plain-language explanations.

---

## 2. Design System Foundation (pre-phase, extends current Tactical HUD)

Already shipped: dark `#03000A` + lime/gold dual accent, Bebas/Rajdhani/Orbitron, HUD navbar (notches, brackets, scanline), toast system, auth form kit, `--nav-h` layout offset, compositor-only motion rules (PRODUCT.md).

To add before feature phases:

| Asset / Component | Driven by | Notes |
|---|---|---|
| **Coin iconography** — two 3D glowing coins (Battle = gold/ember, S = cyan/violet suggested) | REQ-41 | Blocking for every economy screen; design first |
| **Universal Filter Bar** — persistent, collapsible; Rank / Country / Region / Platform / Match Type | REQ-54 | One component reused on Rankings, Fixtures, Tournaments, Live, Cards, Shorts |
| **Player Identity Chip** — avatar + handle + rank + platform icon, 3 sizes | FR-049 | The atomic unit of the whole site; used in rows, chats, brackets, feeds |
| **Match Card family** — upcoming / live / completed states with point deltas, team logos, winner gold accent | FR-011, FR-044…048 | Same skeleton across home feed, fixtures, club pages |
| **Status/State language** — Verified ✓, Pending ⏳, Conflict ⚠, Live ●, tiers/badges | UJ-004, REQ-43 | Single vocabulary, documented |
| **Realtime primitives** — live dot, count-up numbers, skeleton loaders, optimistic states, reconnect banner | §5.24 | Standardized so every live surface behaves identically |
| **Wallet widget** — dual-balance pill in navbar (authenticated), tap → wallet drawer | REQ-44/45 | Always visible; earning events animate into it |
| **Notification primitives** — bell + badge count, toast escalation, push permission prompt flow | REQ-59 | Prompt for push only after first meaningful action (never on landing) |

---

## 3. Information Architecture

```
PUBLIC
├─ Home ................ hero, stat counters, latest 6 results, top-5 preview,
│                        solo identity ticker, shorts strip, promos (FR-009…013)
├─ Tournaments ......... listing grid + slots/countdown, detail w/ bracket (FR-002, §1.3)
├─ Rankings ............ dual tabs (Solo Global / Club National) × (All-time / Season),
│                        device split, crowns, filter bar (FR-049…052, REQ-42/54)
├─ Match Centre ........ fixtures index: Upcoming / Ongoing / Completed (FR-004)
├─ Live ................ stream directory + Live Watch viewer (REQ-48…50, 52)
├─ Shorts .............. vertical snap feed (FR-053…056)
├─ Community ........... country directory → country pages (REQ-53)
├─ News ................ articles, media gallery (FR-005)
├─ Shop ................ merch (S Coins/bKash) + cosmetics (§1.9, REQ-45)
└─ Coming Soon ......... multi-game roster teasers (FR §1.23)

AUTHENTICATED
├─ Player Dashboard .... my matches, queue button, feed, wallet, notifications (FR-006, REQ-40/58)
├─ Profile (public) .... cover, tabs: Overview/News/Timeline/Statistics/Matches,
│                        radar, form grid, dossier export (FR-024…043)
├─ Card Studio ......... player card customization, S Coin spends (REQ-57)
├─ Club space .......... club profile, roster, contracts, chat, wars, scheduling (§1.4, 1.14…1.18, REQ-43)
├─ Match rooms ......... solo battle room, club match room (8 arenas), score submit,
│                        match chat, voice (§1.15…17, REQ-47, UJ-003/004)
└─ Wallet .............. dual ledgers, earn history, P2P transfer, purchases (REQ-44/45)

STAFF
├─ Referee views ....... officiating console, POV stream, feedback profile (§1.28, REQ-49)
└─ Admin console ....... payment ledger, CRUD, site settings, roles (§1.11, 1.36)

OMNIPRESENT
├─ AI chatbot bubble (EN/BN/JP, WhatsApp handoff) (REQ-55)
├─ Notification center + push (REQ-59)
├─ Language switcher EN/BN/JP (§1.12)
└─ Wallet pill + matchmaking queue status (REQ-40/44)
```

---

## 4. Phases

Ordering logic: each phase ships a complete, usable loop; identity before competition, competition before spectacle, money after trust exists, admin last (staff tolerate rough edges; players don't).

### Phase 0 — Design System & IA Shell *(foundation, blocks everything)*
- Deliver §2 components + coin/badge/crown asset set; empty/loading/error state patterns.
- Restructure navigation to the IA above (add Live, Community, Coming Soon; wallet pill; bell).
- Universal Filter Bar interaction spec: persistent per page, remembers selection per session, mobile = bottom-sheet.
- **Exit:** Storybook-style reference page in-app; nav reflects final IA with placeholder routes.

### Phase 1 — Identity & Profile *(the hook)*
- **Overhauled player profile** (FR-024…043): cover + glow avatar + verified badge; metrics header; 5-tab layout; associated teams + contract countdown; career snapshot & best moments; last-50 form grid with streak; ratings bar chart with opponent faces; pitch-position + radar chart; goal-flow + monthly trend charts; achievements; season logs; stats tables; personal info box; Download Dossier (PDF/PNG client-side).
- **Follow system** (REQ-58): follow button on every profile/identity chip; follower counts.
- **Personal feed v1** on dashboard: followed players' results + rank changes.
- Profile edit expansion for the new field set (current form covers a fraction).
- **UX notes:** charts must read on 360px (horizontal scroll for form grid, tap-to-expand charts); dossier export is a brag artifact — design it like a trading card sheet, not a report.
- **Exit:** UJ-007 walkthrough passes on mobile; a guest can admire a player in <5s.

### Phase 2 — Competition Core *(the loop)*
- **Tournaments Hub**: listing with real-time slot grids + countdowns; detail page with entry CTA, bracket visualization, prize breakdown (FR-002, §1.3).
- **Match Centre**: Upcoming/Ongoing/Completed with filter bar; match detail page (FR-004, §1.6).
- **Leaderboards full build**: Solo/Club × All-time/Seasonal tabs; season countdown banner + "Top 20 win S Coins" incentive display; device split; crowns; photo rows; my-row pinning (FR-049…052, REQ-42).
- **Solo Battle flow** (UJ-004): challenge from profile/chat → referee confirmation → match room → dual screenshot upload with auto-verify status → verified celebration. Conflict state = calm, procedural tone ("locked for review"), never accusatory.
- **Matchmaking** (REQ-40): one-tap "Find Match" on dashboard; queue widget with elapsed time + expanding tier hint ("searching ±1 tier…"); decline penalty warning at 2nd decline; found-match full-screen takeover with accept timer.
- **Point transparency**: every result shows its point math (base + upset bonus etc., REQ-46).
- **Exit:** player can register → queue → play → submit → see points move on the ladder, all on mobile.

### Phase 3 — Clubs *(belonging)*
- **Club public profile** + roster; **Club dashboard** for managers (§1.4).
- **Contract lifecycle UX** (UJ-005): invitation inbox → contract review modal (duration/expectations/salary in plain language) → signed state; manager's review table (Active/Expired/Terminated).
- **Club vs Club match flow** (UJ-003): challenge (with coin-gating for upward challenges), confirm, squad selection (exactly 8 + referee, enforced by UI), the **8-arena live board** — the signature screen: 8 sub-match tiles updating live, aggregate score, majority tracker.
- **Club Wars** (REQ-43): war hub page with multi-day timeline, war points table, locked-squad indicator, War Master badge celebration.
- **Club chat** (§1.14) with presence; solo-challenge triggers from chat.
- **Exit:** UJ-003 executes end-to-end; the 8-arena board is demo-worthy.

### Phase 4 — Live & Spectacle *(the show)*
- **Live directory + Live Watch viewer**: quality selector 240p–1080p, live chat, viewer count (REQ-48).
- **Go Live** flow for players (one screen, sane defaults); **Referee POV** one-click live with authority overlay (REQ-49).
- **Watch-to-Earn**: passive progress ring toward next Battle Coin (90 min), daily 3-stream cap indicator; anti-idle affordance kept honest and unobtrusive (REQ-52).
- **Raid** (REQ-50): winning captain's raid picker; viewer-side raid transition (branded sweep, not a jarring redirect).
- **Highlight clips** (REQ-56): auto-clip notifications ("Your goal is a clip 🎬"), Clip It button in viewer, one-tap share to WhatsApp/FB/IG.
- **Chat engagement layer** (REQ-51): emote packs (rank-gated rarity), TTS highlighted messages with viewer mute toggle, Goal Burst animation, P2P coin transfer next to usernames.
- **Voice** (REQ-47): match-room voice join/leave, mic states, referee-isolated channel indicator.
- **UX notes:** all spectacle is transform/opacity-only; every effect has a reduced-motion fallback; viewer chrome auto-hides.
- **Exit:** guest can watch a live match with chat; a player can stream and get raided.

### Phase 5 — Economy & Store *(money after trust)*
- **Dual wallet**: two clearly separated lanes with distinct coin identities, transaction history with earn/spend reason per row (REQ-44/45).
- **Earning celebrations**: streak counter on dashboard (+1 per 2 consecutive wins), tournament win +5, seasonal Top-10 +50 — each with its own micro-moment.
- **Store**: cosmetics (frames, card skins, emote slots — S Coins) vs competitive utilities (challenge gating, ad-free, TTS — Battle Coins) in visually separate sections; merch checkout via bKash TxnID flow with clear Pending → Approved timeline and WhatsApp confirmation expectation (UJ-002/006 pattern).
- **Card Studio** (REQ-57): live-preview card builder; owned vs purchasable assets; S Coin price tags.
- **Emote Studio** (REQ-51): custom emote builder with S Coin slot purchases.
- **P2P transfer**: confirm sheet with recipient identity chip — misdirected coins are the top support risk.
- **Exit:** earn → see it animate into wallet → spend in studio → flaunt on profile card.

### Phase 6 — Community, Feed & Reach *(the network)*
- **Community country pages** (REQ-53): directory + per-country page (Top 10, active clubs, fixtures, "Challenge this country's top player" CTA into cross-country battle gating).
- **Home feed maturation** (REQ-58): follows + streams + rank changes merged; @mention notifications.
- **Shorts feed** (FR-053…056): full-screen snap scroll, z-isolated from navbar.
- **News portal** + media gallery (FR-005).
- **AI chatbot** (REQ-55): floating bubble, EN/BN/JP, live-data answers ("your next match…"), WhatsApp handoff card when stumped.
- **Push notifications + reminders** (REQ-59): notification center, match reminders (15/5 min), Add-to-Calendar, branded shareable result images.
- **Localization** (§1.12): full EN/BN/JP pass; Bangla typography QA (line-height, font pairing for Bengali script).
- **Exit:** a Dhaka player gets a push 15 min before their match, watches, clips, shares to WhatsApp — without leaving the loop.

### Phase 7 — Staff Surfaces *(admin/referee)*
- **Referee console**: officiating pipeline for sub-matches, score submission, feedback profile (§1.28, 1.35).
- **Admin console** (§1.11, 1.36): payment ledger (Pending/Approved/Rejected + audit trail), player/club/tournament CRUD, site settings (hero, promos, stats), announcement manager, shorts URL injection, role matrix for sub-admins, ban/suspension engine UI (§1.19).
- Dense-data design register: tables, keyboard-friendly, no spectacle.
- **Exit:** UJ-006 (payment approval) fully operable; master admin can configure a sub-admin role.

### Phase 8 — Hardening & Delight *(ship quality)*
- Accessibility: contrast audit (≥4.5:1), focus states, screen-reader labels on all identity chips/charts, reduced-motion coverage.
- Performance: route-level code splitting, chart lazy-load, image policy, 60fps verification on mid-range Android; PWA install + offline shell for dashboards.
- Empty/error/edge states sweep: new player (no matches), clubless player, dead season, stream offline, payment rejected.
- Micro-delight pass: rank-up moment, first-win ceremony, season-end recap ("your season card").

---

## 5. Cross-Cutting UX Rules

- **Realtime honesty:** every live surface shows connection state; on reconnect, data visibly refreshes. Never fake liveness.
- **Optimistic UI** for social actions (follow, emote, chat); **pessimistic UI** for money and scores — always server-confirmed with explicit pending states.
- **One filter grammar** (REQ-54): same component, same order (Rank · Country · Region · Platform · Match Type), same persistence behavior, everywhere.
- **Ephemeral by design:** match chat purges on Final Submit (UJ-003) — the UI must say so up front ("chat clears when the match ends"), turning a constraint into fair-play framing.
- **Guest-first pages sell the login:** every public page has exactly one contextual auth CTA (watch → "sign in to earn while watching"; leaderboard → "claim your rank"), never a wall.
- **Glow budget:** max one celebration animation on screen at a time; ambient motion stays compositor-only (see PRODUCT.md perf principles).

## 6. Suggested Build Order & Dependencies

```
P0 ─→ P1 ─→ P2 ─→ P3 ─→ P4 ─→ P6
              └──────→ P5 (needs P2 points + REQ-41 assets from P0)
P7 parallel from P3 onward (staff surfaces)
P8 continuous, final gate before launch
```

Rationale: P1 profile work generates the identity components P2–P4 consume; economy (P5) lands only after competitive trust (verified scores, visible point math) exists; community/reach (P6) amplifies loops that already work.
