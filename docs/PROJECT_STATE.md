# PROJECT_STATE — session handoff

Last updated: **2026-07-16**. Companion to `../CLAUDE.md` (how to run, architecture rules) and `UX_UI_PLAN.md` (the roadmap). This file = what is DONE, what is NEXT, and why.

## Timeline of completed work

| Date | Work |
|---|---|
| 2026-07-08 | Backend bootstrapped (.env, venv, migrate, seed: admin + 6 tournaments). Frontend connected: `lib/api.ts`, tournaments page = first real Server-Component fetch. |
| 2026-07-09 | Auth system: backend hardening (DRF throttles login 10/min · register 5/min · refresh 30/min; Django password validators wired into RegisterSerializer; refresh cookie now also set on register; prod HTTPS/HSTS config; dev CORS fixed to credentialed allowlist). Frontend: auth-context, login/register/profile/profile-edit pages, RequireAuth guard, Next rewrite proxy (same-origin `/api/v1`). Verified via curl: weak-pw 400, 10th login 429, full auth round-trip 200s. |
| 2026-07-12 | Toast notification system (`components/ui/Toast.tsx`), success toasts on login/register/profile-update/logout. |
| 2026-07-13 | Perf overhaul (cursor translate3d; removed infinite gradient anims on filtered display text — was THE home lag), Tactical HUD navbar `#hud-nav` (fixed first-item clipping), global `--nav-h` page offset, PRODUCT.md created. **Rebrand → eBattleVerse**: logo.svg + icon.svg created, all names/metadata/OG/wordmarks swapped, package renamed `ebattleverse-web`. Committed `ee29440`, pushed `authRegister`. |
| 2026-07-16 | Read all 29 backend docs (v2/v3, 540/540 tests). Wrote `docs/UX_UI_PLAN.md` (9-phase UX roadmap). This handoff file created. |
| 2026-07-16 | **Phase 0 SHIPPED**: eb-* design system. `src/components/system/`: CoinIcon (REQ-41 battle=gold+bolt, s=cyan+orbit+star), StatusBadge (single status vocabulary), IdentityChip (sm/md/lg, elite glow, FR-049), MatchCard (upcoming/live/completed, winner gold), FilterBar + useFilters hook (REQ-54: sessionStorage per pageKey, <720px bottom sheet), WalletPill (dual-lane drawer), NotificationBell, Realtime.tsx (LiveDot/CountUp/Skeleton/ReconnectBanner/EmptyState). CSS = `EB DESIGN SYSTEM` section at end of globals.css (all eb-* prefixed). Nav IA final: rail = Home/Tournaments/Rankings/Matches/Live/Community/Clubs/News/Shop; wallet+bell in navbar when authed; new stub routes /live /community /coming-soon. Reference page **/system** (exit criteria — not in nav). All verified in browser: components render, filter persists, sheet pins bottom, no x-scroll. |

| 2026-07-16 | **Phase 1 SHIPPED — Identity & Profile**: `components/profile/ProfileView.tsx` (full FR-024…043 profile: cover, elite-glow avatar, verified tick, 6 stat tiles, 5 tabs Overview/News/Timeline/Statistics/Matches, career snapshot, best moments, last-50 FormGrid, RatingsBars, SVG RadarChart, player info, match log table, polished empty states everywhere) + `components/profile/charts.tsx` (no chart libs). Routes: public `/players/[id]`, own `/profile` rewritten to reuse ProfileView + Edit/Dossier(JSON download)/Logout + Following Feed. API layer extended in `lib/api.ts` (PublicPlayer/Career/Form/Ratings/Analytics/Feed/follow calls — shapes match LIVE backend, which is flatter than v3 doc; `/analytics` 404s server-side → treated as insufficient-data). Follow system REQ-58 verified end-to-end (rifat_99 → secure_sam, follower_count 1). CSS: `EB PROFILE` section end of globals.css. NOTE: backend v2 login = `{identifier,password}` (dual-identifier) — api.ts already migrated. Test player #2: `rifat_99`/`V3rse!Batl9` (mobile). |

| 2026-07-16 | **Phase 2 SHIPPED — Competition Core**: `/rankings` real (5 boards: Solo Identity/Club Match/Mobile/Console/All-Time via `/analytics/leaderboard/{kind}/`; crowns 👑🥈🥉 FR-050, photo rows FR-049, my-row gold FR-052, season banner REQ-42 w/ off-season state). `/matches` Match Centre real (Upcoming/Ongoing/Completed tabs + FilterBar + point transparency from `points_awarded_*`). `MatchmakingWidget` (REQ-40: join/status 4s poll/leave/offer accept-decline, tier-expansion hints) on own profile Overview. api.ts P2 section (leaderboard/seasons/matchmaking/matches). **Fixes**: (1) apiFetch now attaches Bearer BY DEFAULT when token exists (was opt-in `auth:true` — all P1/P2 authed calls were silently anonymous); (2) analytics path corrected to `/analytics/players/{id}/analytics/` (works, returns insufficient_data); (3) queue mode values lowercase `ranked/unranked`, platforms `PS5/Xbox/PC/Mobile`; (4) leaderboard `crown` arrives Capitalized — normalize toLowerCase. Seeded PlayerRankPoints (rank_type values: `SoloIdentity`/`ClubMatch`!): sam 340/120, rifat 210/80. **Matchmaking pairing = Celery task → never fires in dev (no Redis/Celery)** — queue UI works, offers won't appear locally. Verified in browser: ladder rows w/ crowns + board switching, queue join→queued→cancel, match centre tabs+filter. |

| 2026-07-17 | **Phase 3 SHIPPED — Clubs**: `/clubs` directory (rank-ordered, create-club form: name/home_base/admin_pin **min 6 chars**), `/clubs/[id]` profile (hex emblem, referees, performance tiles, roster w/ contract countdowns) + manager tools (invite-by-username via lookup, contracts table). UJ-005 END-TO-END IN UI: InvitationsCard on own profile → ContractModal (30/90/180/365d picker, plain-language terms) → sign → roster join (verified: rifat signed 180d into Dhaka Titans, contract shows Active/179d). `/matches/[id]` detail = **8-arena board** (UJ-003: arena tiles w/ scores/referee/winner, aggregate + majority tracker, 5s poll; empty-state until rosters spawn arenas — no seeded club match yet). `/wars` hub (REQ-43 list, war points, empty state). **3 backend endpoints ADDED** (apps/club + identity): `GET /clubs/` list, `GET /clubs/invitations/mine/` inbox, `GET /players/lookup/?username=`. Seeded: club "Dhaka Titans" cf85f196-6651-4577-a3fb-b152d0f560c0 (manager sam, PIN 442619), rifat member w/ 180d contract. |

| 2026-07-17 | **Phase 5 SHIPPED — Economy & Card Studio**: `/wallet` (dual lanes BC gold / SC cyan w/ plain-language reason labels, tabbed ledgers, P2P transfer w/ lookup→confirm-modal→send + limits display). WalletPill now self-fetches real balances + links to /wallet (prop-less; /system usage updated). `/studio` Card Studio (REQ-57): catalog owned/locked w/ SC prices, purchase, frame+bg live preview (CSS treatments keyed by asset_name — R2 art not wired in dev), save w/ auto-own fallback for free assets (save 403 ASSET_NOT_OWNED → purchase 201 → save 200, verified in network log). api.ts P5 section. **Verified end-to-end**: sam 120 BC/45 SC lanes + 4 ledger rows; transfer 10 BC sam→rifat (confirm modal, ledger −10 `p2p_transfer_out`, rifat +10 `p2p_transfer_in`, balance 40); Gold Ember purchase 45→30 SC. Seeded: CoinLedger/SCoinLedger rows + 6 CardAssets (3 frames/3 bgs). **Gotchas**: LocMem cache per-process — ORM-seeded balances need backend restart to appear (server cached stale 0); purchase via UI slow first hit; /studio cold compile 26s (slow FS). |

## Current state

**Working end-to-end:** register → login → profile → edit profile → logout (with toasts); public tournaments page renders 6 seeded tournaments via SSR through the proxy.

**Pages that exist:** `/` (home, mock data), `/tournaments` (REAL API), `/login` `/register` `/profile` `/profile/edit` (REAL API), everything else = `PageStub` placeholders (`/rankings /matches /news /shop /gallery /clubs /fixtures /sponsorship /about /contact /admin /clubs/login`).

**Still mock:** `src/lib/data.ts` arrays feed the home page (events, shop, players, ticker).

## Backend reality (bigger than the UI)

Backend repo `../eBattleVerse` is at v2/v3: matchmaking (REQ-40), 90-day seasons (42), club wars (43), dual currency Battle/S Coins (44/45), voice WebRTC (47), streaming + referee POV + raids (48–50), watch-to-earn (52), country community pages (53), universal filter (54), AI chatbot (55), highlight clips (56), card studio (57), follows/feed (58), push notifications (59). API spec: `../eBattleVerse/docs/database_and_api_design_v3.md` §5.1–5.25. Requirements: `clean_requirements_analysis_fixed.md` (FR-001–147) + `requirements_gap_analysis_v2.md`.

## Next actions (awaiting user's phase pick)

**P0–P3 + P5 done (2026-07-17).** Remaining phases: **P4 Live & Spectacle** (needs Redis for Channels transport — UI shells possible against §5.20/§5.22 REST), **P6 Community/Reach** (country pages REST live at /social/community/*, shorts, chatbot /platform/chatbot/, notifications, i18n), **P7 staff consoles**, **P8 hardening**. Rolled-forward gaps: photo upload (R2), News/Timeline tabs, is_following flag, tournament detail/bracket, solo-battle room flow, club-vs-club challenge initiation UI, club chat, matchmaking pairing (Redis+Celery), 8-arena board untested w/ real arenas, shop page still stub (merch bKash flow pairs w/ P7 admin ledger), wars create/squad UI (backend ready).

## Known issues / debt

- After pulling backend changes, always run `manage.py migrate` — 2026-07-16 the v2/v3 code was pulled without migrating, causing `no such column: nb_players.s_coin_balance` on every auth request.
- HTTPS dev blocked on one manual step: run `npx next dev --experimental-https` once in an ELEVATED terminal to let mkcert install its root CA; afterwards `npm run dev` works. Until then use `npm run dev:http`.
- Redis not installed on this machine (no Docker/WSL). Backend degrades fine in dev; needed later for websockets/Channels (streaming, chat, voice), Celery, cross-process token revocation. Options: Memurai (native Windows) or WSL/Docker install.
- Both repos sit on branch `authRegister`; main is behind. Merge/PR pending user decision.
- `public/img/*.jpg` old Nobodito assets unused but not deleted.
- Backend `login` TODO stubs: `club_id` and `coin_balance` return null/0 (see `apps/identity/views/auth.py` TODOs) — frontend should not trust them yet.
- Suspension-status polling (backend expects 60s poll, FR-099) not implemented client-side yet.

## Credentials / env (dev only)

- Player: `secure_sam` / `Kr4tos!Neon7` (console/PS5). Django superuser: `admin` / `Admin@12345`.
- `novodito-web/.env.local` (gitignored): `BACKEND_ORIGIN=http://127.0.0.1:8000`, `INTERNAL_API_BASE=http://127.0.0.1:8000/api/v1`.
- `eBattleVerse/backend/.env` (gitignored): SECRET_KEY, `REDIS_URL=redis://localhost:6379/0`, `ALLOWED_HOSTS=localhost,127.0.0.1`.

## Update discipline

When a work session ends: append a row to the timeline, refresh "Current state" + "Next actions", prune fixed items from "Known issues". Keep this file under ~120 lines — it's a handoff, not a changelog archive.
