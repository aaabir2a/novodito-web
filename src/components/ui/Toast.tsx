"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  toast: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE: Record<ToastTone, { border: string; bg: string; color: string; icon: string }> = {
  success: {
    border: "rgba(0,255,127,.45)",
    bg: "linear-gradient(180deg,rgba(0,60,30,.92),rgba(6,20,14,.92))",
    color: "rgba(150,255,200,.98)",
    icon: "✓",
  },
  error: {
    border: "rgba(255,70,70,.5)",
    bg: "linear-gradient(180deg,rgba(60,10,10,.92),rgba(20,6,6,.92))",
    color: "rgba(255,160,160,.98)",
    icon: "⚠️",
  },
  info: {
    border: "rgba(255,184,0,.45)",
    bg: "linear-gradient(180deg,rgba(40,30,6,.92),rgba(18,12,4,.92))",
    color: "rgba(255,220,140,.98)",
    icon: "•",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, message, tone }]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (m: string) => toast(m, "success"),
      error: (m: string) => toast(m, "error"),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          top: 84,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: ".6rem",
          maxWidth: "min(360px, calc(100vw - 40px))",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setShown(true));
    const hide = setTimeout(() => setShown(false), 3600);
    const done = setTimeout(onDone, 4000);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(hide);
      clearTimeout(done);
    };
  }, [onDone]);

  const s = TONE[toast.tone];
  return (
    <div
      role="status"
      onClick={onDone}
      style={{
        pointerEvents: "auto",
        cursor: "pointer",
        display: "flex",
        alignItems: "flex-start",
        gap: ".6rem",
        padding: ".8rem 1rem",
        borderRadius: 12,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        fontFamily: "var(--fb)",
        fontSize: ".9rem",
        boxShadow: "0 14px 40px rgba(0,0,0,.5)",
        backdropFilter: "blur(8px)",
        transform: shown ? "translateX(0)" : "translateX(120%)",
        opacity: shown ? 1 : 0,
        transition: "transform .3s cubic-bezier(.2,.8,.2,1), opacity .3s",
      }}
    >
      <span style={{ fontSize: "1rem", lineHeight: 1.3 }}>{s.icon}</span>
      <span>{toast.message}</span>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
