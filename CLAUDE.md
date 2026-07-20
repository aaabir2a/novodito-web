# eBattleVerse Frontend (novodito-web) — project context

@AGENTS.md

Bangladesh eFootball tournament platform. **Brand: eBattleVerse / eBattleVerse.com** (rebranded 2026-07-13 from "Nobodito Gaming" — folder names still say Novodito). Backend lives in sibling repo `../eBattleVerse` (Django, separate git). Design context: `PRODUCT.md` (Tactical HUD esports lane). Full UX roadmap: `docs/UX_UI_PLAN.md` (9 phases P0–P8). Current working state + decisions: `docs/PROJECT_STATE.md` — **read that first in a new session**.

## Run

- Frontend: `NODE_OPTIONS=--max-old-space-size=4096 npm run dev:http` → http://localhost:3000. The heap flag matters: Turbopack on this machine's slow FS repeatedly crashes with V8 OOM (exit 134, `ReportExternalAllocationLimitReached`) at the default heap. (`npm run dev` = `--experimental-https`, HANGS: mkcert needs an elevated UAC prompt to install its root CA. Until user does that once in an admin terminal, use dev:http.)
- Backend: from `../eBattleVerse/backend`: `DJANGO_SETTINGS_MODULE=config.settings.dev .venv/Scripts/python.exe manage.py runserver 127.0.0.1:8000` (venv exists; SQLite dev DB seeded).
- Logins: player `secure_sam` / `Kr4tos!Neon7` (PS5). Django superuser `admin` / `Admin@12345`.
- Typecheck: `npx tsc --noEmit`. No test suite.

## Architecture (decided, don't relitigate)

- Next 16.2.7 + React 19 App Router, Turbopack. **Next 16 has breaking changes** — read `node_modules/next/dist/docs/` before nontrivial Next work (see AGENTS.md).
- **API transport = same-origin rewrite proxy**: `next.config.ts` rewrites `/api/v1/:path*` → `${BACKEND_ORIGIN}/api/v1/:path*/`. Trailing slash MUST be re-appended (Django APPEND_SLASH rejects slashless POST); `skipTrailingSlashRedirect: true` required. Browser never talks to :8000 directly → no CORS/mixed-content/cookie issues.
- `src/lib/api.ts`: client uses relative `/api/v1`; Server Components use absolute `INTERNAL_API_BASE` (`.env.local`, gitignored: `BACKEND_ORIGIN=http://127.0.0.1:8000`, `INTERNAL_API_BASE=http://127.0.0.1:8000/api/v1`).
- **Auth**: access token in MEMORY ONLY (never localStorage); httpOnly refresh cookie `nb_refresh`; silent refresh on load + on 401. `src/lib/auth-context.tsx` = AuthProvider. Guard: `components/auth/RequireAuth.tsx`. Toasts: `components/ui/Toast.tsx`.
- Data pattern: Server Components for public reads, client components for auth/interactive.

## UI system

- Dark `#03000A`, lime `#39D353`/gold `#FFB800`, fonts Bebas/Rajdhani/Orbitron. Logo `public/logo.svg` (hex + orbit + bolt), favicon `src/app/icon.svg`. SVG through next/image needs `unoptimized` prop.
- Navbar = `#hud-nav` (hn-* classes at END of globals.css; old `#nb` CSS is dormant, don't revive). Rail centering uses li:first/last auto-margins — never `justify-content:center` on a scrollable rail (clips first item).
- Fixed-nav offset: `--nav-h:64px`; `.page:not(#page-home){padding-top:calc(var(--nav-h)+20px)}`. Inner pages must NOT set inline `padding` shorthand (kills the top offset) — use paddingLeft/Right/Bottom only.
- **Perf rules (hard-won)**: no left/top animations (cursor uses translate3d); never combine infinite background-position animation with drop-shadow filters on text (was the big home-page lag); glow budget = one celebration at a time; compositor-only motion.

## Gotchas

- globals.css is ~7k lines extracted from an original static HTML; much is dormant. Append new sections at the end, don't refactor blindly.
- Browser-pane screenshots time out on this machine — verify UI with `javascript_tool` geometry checks + `read_page` accessibility snapshots.
- Kill stale dev servers by PID via `Get-NetTCPConnection -LocalPort 3000` — orphaned node processes serve old code.
- Git: branch `authRegister` on github.com/aaabir2a/novodito-web (main not merged). Backend pushes to github.com/Shafiul-Sabbir/eBattleVerse, also branch `authRegister`.
