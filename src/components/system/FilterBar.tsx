"use client";

// REQ-54 — Universal Filter System. ONE component, one grammar, everywhere:
// Rank · Country · Region · Platform · Match Type (always this order).
// Selection persists per pageKey in sessionStorage. <720px it becomes a
// "Filters" trigger + bottom sheet.

import { useCallback, useEffect, useState } from "react";

export interface FilterState {
  rank: string;
  country: string;
  region: string;
  platform: string;
  matchType: string;
}

export const EMPTY_FILTERS: FilterState = {
  rank: "",
  country: "",
  region: "",
  platform: "",
  matchType: "",
};

const OPTIONS: Record<keyof FilterState, { label: string; values: [string, string][] }> = {
  rank: {
    label: "Rank",
    values: [["top10", "Top 10"], ["top100", "Top 100"], ["top500", "Top 500"]],
  },
  country: {
    label: "Country",
    values: [["BD", "Bangladesh"], ["IN", "India"], ["JP", "Japan"], ["GB", "UK"]],
  },
  region: {
    label: "Region",
    values: [["dhaka", "Dhaka"], ["chittagong", "Chittagong"], ["sylhet", "Sylhet"], ["khulna", "Khulna"]],
  },
  platform: {
    label: "Platform",
    values: [["mobile", "Mobile"], ["console", "Console"]],
  },
  matchType: {
    label: "Match Type",
    values: [["solo", "Solo Battle"], ["club", "Club Match"], ["tournament", "Tournament"], ["war", "Club War"]],
  },
};

const KEYS = Object.keys(OPTIONS) as (keyof FilterState)[];

/** Persisted filter state, keyed per page (e.g. "rankings", "fixtures"). */
export function useFilters(pageKey: string): [FilterState, (f: FilterState) => void] {
  const storageKey = `eb-filters:${pageKey}`;
  const [state, setState] = useState<FilterState>(EMPTY_FILTERS);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) setState({ ...EMPTY_FILTERS, ...JSON.parse(raw) });
    } catch {
      /* corrupted storage — start clean */
    }
  }, [storageKey]);

  const update = useCallback(
    (f: FilterState) => {
      setState(f);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(f));
      } catch {
        /* storage full/blocked — filters still work in-memory */
      }
    },
    [storageKey],
  );

  return [state, update];
}

export default function FilterBar({
  value,
  onChange,
  /** Hide dimensions that make no sense on a page (e.g. matchType on Cards). */
  hide = [],
}: {
  value: FilterState;
  onChange: (f: FilterState) => void;
  hide?: (keyof FilterState)[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const shown = KEYS.filter((k) => !hide.includes(k));
  const activeCount = shown.filter((k) => value[k] !== "").length;

  const set = (k: keyof FilterState, v: string) => onChange({ ...value, [k]: v });
  const reset = () => onChange(EMPTY_FILTERS);

  const controls = (
    <>
      <span className="eb-filter-lb">⌖ Filter</span>
      {shown.map((k) => (
        <select
          key={k}
          aria-label={OPTIONS[k].label}
          className={value[k] ? "active" : undefined}
          value={value[k]}
          onChange={(e) => set(k, e.target.value)}
        >
          <option value="">{OPTIONS[k].label}: All</option>
          {OPTIONS[k].values.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      ))}
      {activeCount > 0 ? (
        <button className="eb-filter-reset" onClick={reset}>
          ✕ Reset
        </button>
      ) : null}
    </>
  );

  return (
    <>
      <button className="eb-filter-toggle" onClick={() => setSheetOpen(true)}>
        ⌖ Filters{activeCount > 0 ? <span className="eb-filter-badge">{activeCount}</span> : null}
      </button>

      {sheetOpen ? <div className="eb-sheet-scrim" onClick={() => setSheetOpen(false)} /> : null}
      <div className={`eb-filter${sheetOpen ? " sheet-open" : ""}`}>
        {controls}
        {sheetOpen ? (
          <button className="btn btn-lm" style={{ justifyContent: "center" }} onClick={() => setSheetOpen(false)}>
            Apply
          </button>
        ) : null}
      </div>
    </>
  );
}
