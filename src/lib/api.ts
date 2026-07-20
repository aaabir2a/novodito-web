// API client for the eBattleVerse Django backend.
//
// Transport & security model
// ───────────────────────────
// • The browser only ever calls the SAME-ORIGIN path `/api/v1/*` (HTTPS in dev
//   via `next dev --experimental-https`). A Next.js rewrite (next.config.ts)
//   proxies that to Django. Result: no mixed content, no CORS, and the refresh
//   cookie is a first-party cookie on this origin.
// • Server Components run in Node and must use an ABSOLUTE URL, so they hit the
//   backend origin directly.
// • The access token lives in memory only (see token store below) — never in
//   localStorage/sessionStorage, so XSS cannot exfiltrate it. On a full reload
//   the token is recovered by calling /auth/refresh against the httpOnly cookie.

const isServer = typeof window === "undefined";

// Server-side: absolute backend origin. Client-side: same-origin proxy path.
const SERVER_API_BASE =
  process.env.INTERNAL_API_BASE ?? "http://127.0.0.1:8000/api/v1";
const CLIENT_API_BASE = "/api/v1";

function base(): string {
  return isServer ? SERVER_API_BASE : CLIENT_API_BASE;
}

// ── In-memory access token store ────────────────────────────────────────────
let accessToken: string | null = null;
export function getAccessToken(): string | null {
  return accessToken;
}
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// ── Errors ──────────────────────────────────────────────────────────────────
/**
 * Walk a backend error body and collect human-readable messages. The API uses
 * several shapes: {error, detail}, {field: {error, detail}}, plain strings, or
 * DRF arrays. Prefer `detail` values (human text) over `error` codes.
 */
function extractMessage(body: unknown, status: number): string {
  const msgs: string[] = [];
  const visit = (v: unknown) => {
    if (v == null) return;
    if (typeof v === "string") {
      msgs.push(v);
    } else if (Array.isArray(v)) {
      v.forEach(visit);
    } else if (typeof v === "object") {
      const o = v as Record<string, unknown>;
      if ("detail" in o) visit(o.detail);
      else Object.values(o).forEach(visit);
    }
  };
  if (body && typeof body === "object" && "detail" in (body as object)) {
    visit((body as Record<string, unknown>).detail);
  } else {
    visit(body);
  }
  const joined = msgs.filter(Boolean).join(" ");
  return joined || `Request failed (${status})`;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(extractMessage(body, status));
    this.name = "ApiError";
    this.status = status;
    const b = (body ?? {}) as Record<string, unknown>;
    const rawCode = b.error;
    this.code = typeof rawCode === "string"
      ? rawCode
      : Array.isArray(rawCode) && typeof rawCode[0] === "string"
        ? rawCode[0]
        : undefined;
    this.body = body;
  }
}

// ── Core fetch ──────────────────────────────────────────────────────────────
export interface ApiFetchOptions extends RequestInit {
  /**
   * Bearer-token behavior. Default: the in-memory access token is attached
   * whenever one exists (harmless on public endpoints, required on player
   * ones). Pass `auth: false` to force an anonymous request.
   */
  auth?: boolean;
  /** Internal: prevents infinite refresh recursion. */
  _retried?: boolean;
}

async function rawFetch<T>(path: string, opts: ApiFetchOptions): Promise<T> {
  const { auth, headers, _retried, ...rest } = opts;
  const res = await fetch(`${base()}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(auth !== false && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...rest,
  });

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

/**
 * Fetch wrapper with one-shot silent refresh: if an authenticated client-side
 * request 401s, try POST /auth/refresh (cookie-based) once, then replay.
 */
export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  try {
    return await rawFetch<T>(path, opts);
  } catch (e) {
    const canRefresh =
      !isServer && opts.auth !== false && e instanceof ApiError && e.status === 401 && !opts._retried;
    if (!canRefresh) throw e;

    // Attempt a single refresh, then replay the original request once.
    const ok = await tryRefresh();
    if (!ok) throw e;
    return rawFetch<T>(path, { ...opts, _retried: true });
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ── Auth types ──────────────────────────────────────────────────────────────
export type DeviceType = "mobile" | "console";
export type ConsoleType = "PS4" | "PS5" | "PC";

export interface RegisterInput {
  username: string;
  password: string;
  device_type: DeviceType;
  console_type?: ConsoleType;
  konami_id?: string;
}
export interface LoginInput {
  identifier: string;
  password: string;
}
export interface AuthResult {
  player_id: string;
  username: string;
  access_token: string;
  platform_role?: string;
  device_type: DeviceType;
}

export interface PlayerProfile {
  id: string;
  username: string;
  konami_id: string | null;
  device_type: DeviceType;
  console_type: ConsoleType | null;
  legal_name: string;
  profile_photo_url: string;
  cover_photo_url: string;
  facebook_url: string;
  discord_url: string;
  konami_portal_url: string;
  birthday: string | null;
  blood_group: string;
  hometown: string;
  location_country: string;
  location_country_code: string;
  location_region: string;
  location_division: string;
  location_city: string;
  is_verified: boolean;
  is_banned: boolean;
  ban_reason: string;
  suspension_until: string | null;
  suspension_expires_at: string | null;
  platform_role: string;
  leaderboard_tier: string;
  created_at: string;
}

export interface ProfileUpdateInput {
  legal_name?: string;
  facebook_url?: string;
  discord_url?: string;
  konami_portal_url?: string;
  birthday?: string | null;
  blood_group?: string;
  hometown?: string;
}

// ── Auth calls (client-side) ─────────────────────────────────────────────────
export async function register(input: RegisterInput): Promise<AuthResult> {
  const data = await apiFetch<AuthResult>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAccessToken(data.access_token);
  return data;
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const data = await apiFetch<AuthResult>("/auth/login/", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAccessToken(data.access_token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout/", { method: "POST", auth: true });
  } finally {
    setAccessToken(null);
  }
}

/** Mint a fresh access token from the httpOnly refresh cookie. */
export async function tryRefresh(): Promise<boolean> {
  try {
    const data = await rawFetch<{ access_token: string }>("/auth/refresh/", {
      method: "POST",
    });
    setAccessToken(data.access_token);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

export function getMe(): Promise<PlayerProfile> {
  return apiFetch<PlayerProfile>("/players/me/", { auth: true, cache: "no-store" });
}

export function updateProfile(input: ProfileUpdateInput): Promise<PlayerProfile> {
  return apiFetch<PlayerProfile>("/auth/profile/", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(input),
  });
}

// ── Tournaments (public, server-side) ────────────────────────────────────────
export interface ApiTournament {
  id: string;
  name: string;
  mode: "LAN" | "Online" | "Hybrid";
  bracket_type: "RoundRobin" | "SingleElim" | "DoubleElim";
  max_slots: number;
  filled_slots: number;
  slots_remaining: number;
  slots_full: boolean;
  entry_fee_bdt: number;
  prize_pool_bdt: number;
  status: "Registration" | "Ongoing" | "Completed" | "Cancelled";
  starts_at: string | null;
  ends_at: string | null;
}
export interface TournamentListResponse {
  total: number;
  page: number;
  tournaments: ApiTournament[];
}

export function getTournaments(
  params: { status?: string; mode?: string; page?: number; limit?: number } = {},
): Promise<TournamentListResponse> {
  const qs = new URLSearchParams();
  if (params.status !== undefined) qs.set("status", params.status);
  if (params.mode) qs.set("mode", params.mode);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return apiFetch<TournamentListResponse>(`/tournaments/${q ? `?${q}` : ""}`, {
    next: { revalidate: 60 },
  } as ApiFetchOptions);
}

/* ───────────────────────── Phase 1: Player Profile & Social ─────────────────
   Shapes mirror the LIVE backend responses (which are flatter than the v3 doc
   in places — /players/me/ is a flat identity serializer, /players/{id}/ is
   the nested public profile). Verified against the running API 2026-07-16. */

export interface PublicPlayer {
  id: string;
  username: string;
  legal_name: string | null;
  is_verified: boolean;
  is_banned: boolean;
  cover_photo_url: string | null;
  profile_photo_url: string | null;
  location: { country: string; region: string; division: string; city: string };
  primary_club: {
    id: string;
    name: string;
    emblem_url: string | null;
    contract_days_remaining: number | null;
  } | null;
  social_links: { facebook: string | null; discord: string | null; konami: string | null };
  stats_summary: {
    total_matches: number;
    total_wins: number;
    win_rate_pct: number;
    total_goals: number;
  };
  rank_points: { club_match: number; solo_identity: number };
  follower_count: number;
  following_count: number;
  like_count: number;
  device_type: DeviceType;
  platform_role: string;
  current_win_streak: number;
  created_at: string;
  /** own-profile only */
  s_coin_balance?: number;
  elite_rank?: boolean;
}

export interface CareerData {
  debut: { played_at: string; opponent_username: string; opponent_id: string } | null;
  last_match: { played_at: string; opponent_username: string } | null;
  avg_match_delay_days: number | null;
  max_gap_days: number | null;
  best_moments: {
    longest_unbeaten_streak: { count: number; started_at: string; ended_at: string } | null;
    max_goals_match: {
      goals: number;
      opponent_username: string;
      scoreline: string;
      played_at: string;
    } | null;
    most_defeated_opponent: {
      opponent_id: string;
      opponent_username: string;
      defeat_count: number;
    } | null;
  } | null;
}

export interface FormMatch {
  result: "Win" | "Loss" | "Draw";
  score: string;
  opponent_id: string;
  opponent_username: string;
  played_at: string;
}
export interface FormData {
  current_unbeaten_streak: number;
  matches: FormMatch[];
}

export interface RatingEntry {
  match_rating: number;
  opponent_id: string;
  opponent_photo_url: string | null;
  played_at: string;
}

export interface AnalyticsData {
  position_label: string;
  position_confidence: "high" | "medium" | "low";
  radar: {
    passing_precision: number;
    shooting_accuracy: number;
    defensive_contrib: number;
    possession_retention: number;
    physical_stamina: number;
  };
  insufficient_data: boolean;
}

export function getPlayer(id: string): Promise<PublicPlayer> {
  return apiFetch<PublicPlayer>(`/players/${id}/`);
}
export function getPlayerCareer(id: string): Promise<CareerData> {
  return apiFetch<CareerData>(`/players/${id}/career/`);
}
export function getPlayerForm(id: string): Promise<FormData> {
  return apiFetch<FormData>(`/players/${id}/form/`);
}
export function getPlayerRatings(id: string): Promise<{ ratings: RatingEntry[] }> {
  return apiFetch<{ ratings: RatingEntry[] }>(`/players/${id}/ratings/`);
}
/** Lives under /analytics/ prefix (not /players/). Failure → treat as insufficient data. */
export async function getPlayerAnalytics(id: string): Promise<AnalyticsData | null> {
  try {
    return await apiFetch<AnalyticsData>(`/analytics/players/${id}/analytics/`);
  } catch {
    return null;
  }
}
export function exportDossier(id: string): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/players/${id}/export-dossier/`);
}

/* ── Social (REQ-58) ── */

export interface FeedItem {
  id?: string;
  type?: string;
  actor_username?: string;
  actor_id?: string;
  message?: string;
  created_at?: string;
  [key: string]: unknown;
}

export function getFeed(limit = 20, offset = 0): Promise<{ feed: FeedItem[]; next_offset: number | null }> {
  return apiFetch(`/social/feed/?limit=${limit}&offset=${offset}`);
}
export function followPlayer(id: string): Promise<unknown> {
  return apiFetch(`/social/players/${id}/follow/`, { method: "POST" });
}
export function unfollowPlayer(id: string): Promise<unknown> {
  return apiFetch(`/social/players/${id}/follow/`, { method: "DELETE" });
}
export interface FollowListEntry {
  player_id: string;
  username: string;
  profile_photo_url?: string | null;
  followed_at?: string;
}
export function getFollowers(id: string): Promise<{ followers: FollowListEntry[]; count: number }> {
  return apiFetch(`/social/players/${id}/followers/`);
}
export function getFollowing(id: string): Promise<{ following: FollowListEntry[]; count: number }> {
  return apiFetch(`/social/players/${id}/following/`);
}

/* ───────────────────────── Phase 2: Competition Core ────────────────────────
   Leaderboards live under /analytics/leaderboard/*; matchmaking under
   /matchmaking/*. Shapes verified against running backend 2026-07-16. */

export interface LeaderboardRow {
  rank: number;
  player_id: string;
  username: string;
  profile_photo_url: string | null;
  club_name: string | null;
  rank_points: number;
  /** Backend sends capitalized ("Gold"); normalize with .toLowerCase() before use. */
  crown: string | null;
}
export interface LeaderboardPage {
  total_players: number;
  rankings: LeaderboardRow[];
}
export type LeaderboardKind =
  | "solo-identity"
  | "club-match"
  | "mobile"
  | "console"
  | "all-time";

export function getLeaderboard(
  kind: LeaderboardKind,
  page = 1,
  limit = 50,
): Promise<LeaderboardPage> {
  return apiFetch(`/analytics/leaderboard/${kind}/?page=${page}&limit=${limit}`);
}
export function getLeaderboardPreview(): Promise<{
  club_match_top5: LeaderboardRow[];
  solo_identity_top5: LeaderboardRow[];
}> {
  return apiFetch(`/analytics/leaderboard/preview/`);
}

export interface Season {
  id: string;
  name?: string;
  starts_at?: string;
  ends_at?: string;
  status?: string;
  [key: string]: unknown;
}
/** Returns null when backend says NO_ACTIVE_SEASON. */
export async function getActiveSeason(): Promise<Season | null> {
  try {
    return await apiFetch<Season>(`/seasons/active/`);
  } catch {
    return null;
  }
}

/* ── Matchmaking (REQ-40) ── */
export type QueuePlatform = "PS5" | "Xbox" | "PC" | "Mobile";
/** Backend choice values are lowercase (display labels are capitalized). */
export type QueueMode = "ranked" | "unranked";

export interface QueueStatus {
  in_queue: boolean;
  queue_id?: string;
  elapsed_seconds?: number;
  estimated_wait_seconds?: number;
  pending_offer: {
    offer_id: string;
    opponent_username?: string;
    expires_in_seconds?: number;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export function joinQueue(platform: QueuePlatform, mode: QueueMode): Promise<{ queue_id: string; estimated_wait_seconds: number }> {
  return apiFetch(`/matchmaking/join/`, { method: "POST", body: JSON.stringify({ platform, mode }) });
}
export function leaveQueue(): Promise<{ detail: string }> {
  return apiFetch(`/matchmaking/leave/`, { method: "POST" });
}
export function getQueueStatus(): Promise<QueueStatus> {
  return apiFetch(`/matchmaking/status/`);
}
export function respondToOffer(offerId: string, accept: boolean): Promise<unknown> {
  return apiFetch(`/matchmaking/respond/`, { method: "POST", body: JSON.stringify({ offer_id: offerId, accept }) });
}

/* ── Match Centre ── */
export interface ApiMatch {
  id: string;
  type: string;
  referee_mode?: string | null;
  status: string;
  club_a: string | null;
  club_a_name: string | null;
  club_b: string | null;
  club_b_name: string | null;
  player_a: string | null;
  player_a_username: string | null;
  player_b: string | null;
  player_b_username: string | null;
  coin_challenge: boolean;
  coin_cost: number | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  winner_club: string | null;
  winner_club_name: string | null;
  is_draw: boolean;
  points_awarded_a: number | null;
  points_awarded_b: number | null;
  created_at: string;
}
export function getMatches(): Promise<ApiMatch[]> {
  return apiFetch(`/matches/`);
}

/* ───────────────────────── Phase 3: Clubs ───────────────────────────────────
   Club directory/detail/roster, invitations + contract accept (UJ-005),
   club-vs-club match detail with 8 sub-match arenas (UJ-003), club wars. */

export interface ClubListItem {
  id: string;
  name: string;
  emblem_url: string | null;
  home_base: string;
  rank_points: number;
  roster_count: number;
  manager_username: string;
  created_at: string;
}
export interface ClubDetail {
  id: string;
  name: string;
  emblem_url: string | null;
  home_base: string;
  manager: { id: string; username: string };
  rank_points: number;
  roster_count: number;
  roster_full: boolean;
  permanent_referee: { id: string; username: string } | null;
  alternate_referee: { id: string; username: string } | null;
  performance: Record<string, number> | null;
  created_at: string;
}
export interface RosterMember {
  player_id: string;
  username: string;
  profile_photo_url: string | null;
  contract_status: string | null;
  contract_days_remaining: number | null;
  joined_at: string;
}
export interface ClubInvitation {
  id: string;
  club_id: string;
  club_name: string;
  club_emblem_url: string | null;
  club_rank_points: number;
  status: string;
  created_at: string;
}
export interface ClubContract {
  id: string;
  player_id: string;
  username: string;
  status: string;
  signed_at: string | null;
  expires_at: string | null;
  days_remaining: number | null;
}

export function getClubs(): Promise<{ clubs: ClubListItem[] }> {
  return apiFetch(`/clubs/`);
}
export function getClub(id: string): Promise<ClubDetail> {
  return apiFetch(`/clubs/${id}/`);
}
export function getClubRoster(id: string): Promise<{ roster_count: number; roster_full: boolean; members: RosterMember[] }> {
  return apiFetch(`/clubs/${id}/roster/`);
}
export function createClub(input: { name: string; home_base?: string; admin_pin: string }): Promise<{ club_id: string }> {
  return apiFetch(`/clubs/`, { method: "POST", body: JSON.stringify(input) });
}
export function lookupPlayer(username: string): Promise<{ id: string; username: string; profile_photo_url: string | null; device_type: string }> {
  return apiFetch(`/players/lookup/?username=${encodeURIComponent(username)}`);
}
export function invitePlayer(clubId: string, playerId: string): Promise<unknown> {
  return apiFetch(`/clubs/${clubId}/invitations/`, { method: "POST", body: JSON.stringify({ player_id: playerId }) });
}
export function getMyInvitations(): Promise<{ invitations: ClubInvitation[] }> {
  return apiFetch(`/clubs/invitations/mine/`);
}
export function acceptInvitation(
  clubId: string,
  invitationId: string,
  contract: { duration_days: number; performance_terms?: string },
): Promise<unknown> {
  return apiFetch(`/clubs/${clubId}/invitations/${invitationId}/accept/`, {
    method: "PUT",
    body: JSON.stringify({ contract }),
  });
}
export function getClubContracts(clubId: string): Promise<{ contracts: ClubContract[] } | ClubContract[]> {
  return apiFetch(`/clubs/${clubId}/contracts/`);
}

/* ── Match detail: 8-arena board (UJ-003) ── */
export interface SubMatch {
  id: string;
  arena_number: number;
  status: string;
  player_a: string;
  player_a_username: string;
  player_b: string;
  player_b_username: string;
  score_a: number | null;
  score_b: number | null;
  winner: string | null;
  winner_username: string | null;
  referee: string | null;
  referee_username: string | null;
  submitted_at: string | null;
}
export interface MatchDetail extends ApiMatch {
  sub_matches: SubMatch[];
  rosters: unknown[];
}
export function getMatch(id: string): Promise<MatchDetail> {
  return apiFetch(`/matches/${id}/`);
}

/* ── Club Wars (REQ-43) ── */
export interface ClubWar {
  id: string;
  status: string;
  challenger_club?: string | null;
  challenger_club_name?: string | null;
  opponent_club?: string | null;
  opponent_club_name?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  war_points_challenger?: number;
  war_points_opponent?: number;
  [key: string]: unknown;
}
export function getWars(): Promise<{ wars: ClubWar[] }> {
  return apiFetch(`/wars/`);
}

/* ───────────────────────── Phase 5: Economy & Card Studio ───────────────────
   Dual-currency wallet (REQ-44/45): Battle Coins (/economy/*) vs S Coins
   (/economy/s-coins/*), P2P transfer with caps, Card Studio (REQ-57). */

export interface CoinTx {
  id: string;
  amount: number;
  direction: "credit" | "debit";
  reason: string;
  ref_id: string | null;
  created_at: string;
}
export function getCoinBalance(): Promise<{ balance: number }> {
  return apiFetch(`/economy/balance/`);
}
export function getCoinLedger(page = 1): Promise<{ balance: number; transactions: CoinTx[] }> {
  return apiFetch(`/economy/ledger/?page=${page}&limit=30`);
}
export interface SCoinTx {
  id: string;
  amount: number;
  transaction_type: "credit" | "debit";
  reason: string;
  ref_id?: string | null;
  created_at: string;
}
export function getSCoinBalance(): Promise<{ s_coin_balance: number }> {
  return apiFetch(`/economy/s-coins/balance/`);
}
export function getSCoinLedger(page = 1): Promise<{ s_coin_balance: number; transactions: SCoinTx[] }> {
  return apiFetch(`/economy/s-coins/ledger/?page=${page}&limit=30`);
}

export interface TransferLimits {
  per_tx_max: number;
  daily_send_remaining: number;
  daily_receive_remaining: number;
}
export function getTransferLimits(): Promise<TransferLimits> {
  return apiFetch(`/economy/coins/transfer/limits/`);
}
export function transferCoins(recipientPlayerId: string, amount: number): Promise<unknown> {
  return apiFetch(`/economy/coins/transfer/`, {
    method: "POST",
    body: JSON.stringify({ recipient_player_id: recipientPlayerId, amount }),
  });
}

/* ── Card Studio (REQ-57) ── */
export interface CardAsset {
  id: string;
  asset_type: "frame" | "background";
  asset_name: string;
  s_coin_price: number;
  owned: boolean;
}
export interface CardConfig {
  frame_asset_id: string | null;
  background_asset_id: string | null;
  frame_url: string | null;
  background_url: string | null;
  updated_at: string | null;
}
export function getCardAssets(): Promise<{ assets: CardAsset[] }> {
  return apiFetch(`/platform/card-studio/assets/`);
}
export function getCardConfig(): Promise<CardConfig> {
  return apiFetch(`/platform/card-studio/cards/`);
}
export function purchaseCardAsset(assetId: string): Promise<unknown> {
  return apiFetch(`/platform/card-studio/assets/${assetId}/purchase/`, { method: "POST" });
}
export function saveCardConfig(frameAssetId: string | null, backgroundAssetId: string | null): Promise<CardConfig> {
  return apiFetch(`/platform/card-studio/save/`, {
    method: "POST",
    body: JSON.stringify({ frame_asset_id: frameAssetId, background_asset_id: backgroundAssetId }),
  });
}

/* ───────────────────────── Phase 6: Community & Reach ───────────────────────
   Country pages (REQ-53), notifications (REQ-59), shorts (FR-053…056), news. */

export interface CountryEntry {
  country: string;
  country_code: string;
  player_count: number;
}
export interface CountryPage {
  country: string;
  country_code: string;
  player_count: number;
  top_players: { rank: number; player_id: string; username: string; profile_photo_url: string | null; rank_points: number }[];
  clubs: { id: string; name: string; emblem_url: string | null; rank_points: number }[];
  upcoming_fixtures: { id: string; type: string; player_a_username: string | null; player_b_username: string | null; scheduled_at: string | null }[];
}
export function getCommunityCountries(): Promise<{ countries: CountryEntry[] }> {
  return apiFetch(`/social/community/countries/`);
}
export function getCommunityCountry(code: string): Promise<CountryPage> {
  return apiFetch(`/social/community/${encodeURIComponent(code)}/`);
}

export interface ApiNotification {
  id: string;
  notification_type: string;
  context: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}
export function getNotifications(page = 1): Promise<{ notifications: ApiNotification[]; unread_count: number; total: number }> {
  return apiFetch(`/social/notifications/?page=${page}&limit=20`);
}
export function markNotificationRead(id: string): Promise<unknown> {
  return apiFetch(`/social/notifications/${id}/read/`, { method: "PUT" });
}
export function markAllNotificationsRead(): Promise<unknown> {
  return apiFetch(`/social/notifications/read-all/`, { method: "PUT" });
}

export interface MediaShort {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  tags: string[];
  view_count: number;
  status: string;
  creator: string | null;
  creator_username: string | null;
  created_at: string;
}
export function getShorts(): Promise<{ shorts: MediaShort[] }> {
  return apiFetch(`/social/shorts/`);
}

export interface NewsArticle {
  id: string;
  title: string;
  body: string;
  author_username: string | null;
  is_pinned: boolean;
  status: string;
  published_at: string | null;
  created_at: string;
}
export function getNews(): Promise<NewsArticle[] | { articles: NewsArticle[] }> {
  return apiFetch(`/social/news/`);
}
export function getHomeStats(): Promise<{ total_players: number; total_tournaments: number; total_prize_bdt: number; total_countries: number }> {
  return apiFetch(`/social/home/stats/`);
}

/* ───────────────────────── Phase 7: Staff Consoles ──────────────────────────
   Admin dashboard, payment ledger (UJ-006), player moderation, audit log,
   referee profile. All admin endpoints require admin/master platform_role. */

export interface AdminDashboard {
  active_users_now: number;
  pending_payments: number;
  active_matches: number;
  pending_transfers: number;
  disputed_battles: number;
  total_players: number;
  total_clubs: number;
}
export function getAdminDashboard(): Promise<AdminDashboard> {
  return apiFetch(`/admin/dashboard/`);
}

export interface PaymentEntry {
  id: string;
  tournament: string;
  tournament_name: string;
  club: string;
  club_name: string;
  txn_id: string;
  whatsapp: string | null;
  manager_handle: string | null;
  player_count: number;
  payment_status: "Pending" | "Approved" | "Rejected";
  approved_by_username: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  reject_reason: string | null;
  created_at: string;
}
export function getAdminPayments(status?: string): Promise<PaymentEntry[]> {
  return apiFetch(`/economy/admin/payments/${status ? `?status=${status}` : ""}`);
}
export function approvePayment(entryId: string): Promise<unknown> {
  return apiFetch(`/economy/admin/payments/${entryId}/approve/`, { method: "PUT" });
}
export function rejectPayment(entryId: string, reason: string): Promise<unknown> {
  return apiFetch(`/economy/admin/payments/${entryId}/reject/`, {
    method: "PUT",
    body: JSON.stringify({ reject_reason: reason }),
  });
}

export interface AdminPlayer {
  id: string;
  username: string;
  profile_photo_url: string | null;
  platform_role: string;
  device_type: string;
  is_verified: boolean;
  is_banned: boolean;
  is_suspended: boolean;
  ban_reason: string;
  location_country: string;
}
export function getAdminPlayers(params: { q?: string; role?: string; status?: string } = {}): Promise<{ total: number; players: AdminPlayer[] }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.role) qs.set("role", params.role);
  if (params.status) qs.set("status", params.status);
  const q = qs.toString();
  return apiFetch(`/admin/players/${q ? `?${q}` : ""}`);
}
export function banPlayer(playerId: string, reason: string): Promise<unknown> {
  return apiFetch(`/admin/players/${playerId}/ban/`, { method: "POST", body: JSON.stringify({ reason }) });
}
export function suspendPlayer(playerId: string, durationHours: number, reason: string): Promise<unknown> {
  return apiFetch(`/admin/players/${playerId}/suspend/`, { method: "POST", body: JSON.stringify({ duration_hours: durationHours, reason }) });
}
export function verifyPlayer(playerId: string, isVerified: boolean): Promise<unknown> {
  return apiFetch(`/admin/players/${playerId}/verify/`, { method: "PUT", body: JSON.stringify({ is_verified: isVerified }) });
}
export function assignRole(playerId: string, platformRole: string): Promise<unknown> {
  return apiFetch(`/admin/players/${playerId}/role/`, { method: "PUT", body: JSON.stringify({ platform_role: platformRole }) });
}

export interface AuditLogRow {
  id: string;
  admin_username: string;
  action_type: string;
  target_entity: string;
  target_id: string | null;
  note: string | null;
  created_at: string;
}
export function getAuditLog(page = 1): Promise<{ total: number; logs: AuditLogRow[] }> {
  return apiFetch(`/admin/audit-log/?page=${page}&limit=50`);
}

export interface RefereeProfile {
  player_id: string;
  username: string;
  profile_photo_url: string | null;
  club_name: string | null;
  matches_officiated: number;
  avg_star_rating: number | null;
  pinned_review: { comment: string; stars: number; rated_by: string } | null;
}
export function getRefereeProfile(playerId: string): Promise<RefereeProfile> {
  return apiFetch(`/social/referees/${playerId}/`);
}
