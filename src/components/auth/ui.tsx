"use client";

import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

// Themed, dependency-free form primitives that match the dark/neon site styling.

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  maxWidth = 460,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
}) {
  return (
    <div
      className="page act"
      style={{
        // top padding comes from the global fixed-nav offset (.page rule)
        paddingLeft: "1.25rem",
        paddingRight: "1.25rem",
        paddingBottom: "5rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth }}>
        <div
          style={{
            border: "1px solid rgba(255,184,0,.16)",
            background: "linear-gradient(180deg,rgba(20,12,40,.72),rgba(6,0,24,.72))",
            borderRadius: 18,
            padding: "2.25rem 2rem",
            boxShadow: "0 30px 80px rgba(0,0,0,.45)",
            backdropFilter: "blur(6px)",
          }}
        >
          <h1
            className="ht"
            style={{ fontSize: "2rem", lineHeight: 1.05, marginBottom: subtitle ? ".4rem" : "1.5rem" }}
          >
            <span className="go">{title}</span>
          </h1>
          {subtitle ? (
            <p className="hd" style={{ marginBottom: "1.75rem", fontSize: ".95rem" }}>
              {subtitle}
            </p>
          ) : null}
          {children}
          {footer ? (
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid rgba(255,255,255,.08)",
                fontSize: ".9rem",
                color: "rgba(220,210,240,.75)",
              }}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: "var(--fh)",
  fontSize: ".72rem",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "rgba(200,190,225,.8)",
  marginBottom: ".4rem",
};

const controlStyle: CSSProperties = {
  width: "100%",
  padding: ".7rem .85rem",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(4,2,14,.6)",
  color: "#fff",
  fontFamily: "var(--fb)",
  fontSize: ".95rem",
  outline: "none",
};

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint ? (
        <p style={{ margin: ".4rem 0 0", fontSize: ".78rem", color: "rgba(180,170,205,.7)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...controlStyle, ...(props.style ?? {}) }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,184,0,.6)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,.14)";
        props.onBlur?.(e);
      }}
    />
  );
}

export function SelectInput(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  return <select {...props} style={{ ...controlStyle, ...(props.style ?? {}) }} />;
}

export function SubmitButton({
  children,
  loading,
  disabled,
}: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      className="btn btn-lm"
      disabled={loading || disabled}
      style={{
        width: "100%",
        justifyContent: "center",
        marginTop: ".5rem",
        opacity: loading || disabled ? 0.6 : 1,
        cursor: loading || disabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        marginBottom: "1.1rem",
        padding: ".75rem .9rem",
        borderRadius: 10,
        border: "1px solid rgba(255,60,60,.4)",
        background: "rgba(255,40,40,.08)",
        color: "rgba(255,140,140,.95)",
        fontSize: ".88rem",
      }}
    >
      ⚠️ {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      style={{
        marginBottom: "1.1rem",
        padding: ".75rem .9rem",
        borderRadius: 10,
        border: "1px solid rgba(0,255,127,.35)",
        background: "rgba(0,255,127,.08)",
        color: "rgba(120,255,180,.95)",
        fontSize: ".88rem",
      }}
    >
      ✓ {message}
    </div>
  );
}
