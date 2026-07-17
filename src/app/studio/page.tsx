"use client";

// Phase 5 — Player Card Customization Studio (REQ-57).
// Pick a frame + background → live card preview → save (free, owned assets
// only). Locked assets show S Coin price; purchase deducts S Coins.
// Dev note: asset art lives in R2 (not wired locally), so each asset renders
// as a themed CSS treatment keyed by its name — the flow is identical.

import { useCallback, useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import CoinIcon from "@/components/system/CoinIcon";
import { EmptyState, Skeleton } from "@/components/system/Realtime";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import {
  ApiError,
  getCardAssets,
  getCardConfig,
  getSCoinBalance,
  purchaseCardAsset,
  saveCardConfig,
  type CardAsset,
} from "@/lib/api";

// Themed CSS per asset name (stand-in for R2 art; flow unchanged).
const FRAME_CSS: Record<string, string> = {
  "Lime Circuit": "linear-gradient(135deg,#39D353,#0a5c26)",
  "Gold Ember": "linear-gradient(135deg,#FFB800,#7a4b00)",
  "Violet Storm": "linear-gradient(135deg,#BF5FFF,#3a1f7a)",
};
const BG_CSS: Record<string, string> = {
  "Night Pitch": "radial-gradient(circle at 30% 20%,#0e2818,#03000A 70%)",
  "Neon Grid": "repeating-linear-gradient(0deg,rgba(57,211,83,.12) 0 1px,transparent 1px 14px),repeating-linear-gradient(90deg,rgba(57,211,83,.12) 0 1px,transparent 1px 14px),#050214",
  "Ember Sky": "linear-gradient(180deg,#2b1602,#0d0208 70%)",
};

function StudioInner() {
  const { user } = useAuth();
  const toast = useToast();
  const [assets, setAssets] = useState<CardAsset[] | null>(null);
  const [balance, setBalance] = useState(0);
  const [frameId, setFrameId] = useState<string | null>(null);
  const [bgId, setBgId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    getCardAssets().then((d) => setAssets(d.assets)).catch(() => setAssets([]));
    getSCoinBalance().then((d) => setBalance(d.s_coin_balance)).catch(() => null);
    getCardConfig()
      .then((c) => {
        setFrameId(c.frame_asset_id);
        setBgId(c.background_asset_id);
      })
      .catch(() => null);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const frames = (assets ?? []).filter((a) => a.asset_type === "frame");
  const bgs = (assets ?? []).filter((a) => a.asset_type === "background");
  const frame = frames.find((a) => a.id === frameId) ?? null;
  const bg = bgs.find((a) => a.id === bgId) ?? null;

  const pick = async (a: CardAsset) => {
    if (a.owned || a.s_coin_price === 0) {
      // free assets may still need ownership server-side on first save; try select directly
      if (a.asset_type === "frame") setFrameId(a.id === frameId ? null : a.id);
      else setBgId(a.id === bgId ? null : a.id);
      return;
    }
    if (balance < a.s_coin_price) {
      toast.error(`Not enough S Coins — ${a.asset_name} costs ${a.s_coin_price}, you have ${balance}.`);
      return;
    }
    setBusy(true);
    try {
      await purchaseCardAsset(a.id);
      toast.success(`Unlocked ${a.asset_name} 🎨`);
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Purchase failed");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      await saveCardConfig(frameId, bgId);
      toast.success("Card saved — it shows wherever your identity appears ✨");
    } catch (e) {
      // free assets still require ownership rows server-side
      if (e instanceof ApiError && e.message.includes("ASSET_NOT_OWNED")) {
        try {
          if (frame && !frame.owned) await purchaseCardAsset(frame.id);
          if (bg && !bg.owned) await purchaseCardAsset(bg.id);
          await saveCardConfig(frameId, bgId);
          toast.success("Card saved ✨");
          load();
          return;
        } catch {
          /* fall through to error toast */
        }
      }
      toast.error(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const AssetTile = ({ a }: { a: CardAsset }) => {
    const selected = a.id === frameId || a.id === bgId;
    const css = a.asset_type === "frame" ? FRAME_CSS[a.asset_name] : BG_CSS[a.asset_name];
    return (
      <button
        className={`eb-asset${selected ? " on" : ""}${!a.owned && a.s_coin_price > 0 ? " locked" : ""}`}
        disabled={busy}
        onClick={() => pick(a)}
        title={a.asset_name}
      >
        <span className="sw" style={{ background: css ?? "rgba(255,255,255,.08)" }} />
        <span className="nm">{a.asset_name}</span>
        {a.owned || a.s_coin_price === 0 ? (
          <span className="pr free">{a.owned ? "Owned" : "Free"}</span>
        ) : (
          <span className="pr"><CoinIcon type="s" size={12} /> {a.s_coin_price}</span>
        )}
      </button>
    );
  };

  return (
    <div className="page act" style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.1rem" }}>
          <h1 className="ht" style={{ fontSize: "2.2rem" }}><span className="ac">CARD</span> <span className="go">STUDIO</span></h1>
          <span className="eb-wallet-bal sc" style={{ fontSize: ".8rem" }}>
            <CoinIcon type="s" size={18} /> {balance} S Coins
          </span>
        </div>

        <div className="eb-studio">
          {/* Live preview */}
          <div className="eb-card-preview" style={{ background: bg ? BG_CSS[bg.asset_name] : "rgba(10,6,22,.8)" }}>
            <div className="eb-card-frame" style={{ background: frame ? FRAME_CSS[frame.asset_name] : "rgba(255,255,255,.15)" }}>
              <div className="eb-card-inner">
                <span className="av">{user?.username.charAt(0).toUpperCase()}</span>
                <b>{user?.username}</b>
                <span className="sub">{user?.leaderboard_tier ?? "Player"} · eBattleVerse</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <section className="eb-pf-card">
              <h3>Frames</h3>
              {assets === null ? <Skeleton style={{ width: "100%", height: 70 }} /> :
                frames.length === 0 ? <EmptyState icon="🖼️" title="No frames yet" /> : (
                  <div className="eb-asset-grid">{frames.map((a) => <AssetTile key={a.id} a={a} />)}</div>
                )}
            </section>
            <section className="eb-pf-card">
              <h3>Backgrounds</h3>
              {assets === null ? <Skeleton style={{ width: "100%", height: 70 }} /> :
                bgs.length === 0 ? <EmptyState icon="🎨" title="No backgrounds yet" /> : (
                  <div className="eb-asset-grid">{bgs.map((a) => <AssetTile key={a.id} a={a} />)}</div>
                )}
            </section>
            <button className="btn btn-lm" disabled={busy} onClick={save}>💾 Save Card</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <RequireAuth>
      <StudioInner />
    </RequireAuth>
  );
}
