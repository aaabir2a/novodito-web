import Link from "next/link";

export default function PageStub({
  icon,
  title,
  blurb,
}: {
  icon: string;
  title: string;
  blurb: string;
}) {
  return (
    <div className="page act">
      {/* .page already carries the fixed-nav top offset */}
      <div className="wrap" style={{ padding: "1.5rem 1.8rem 6rem" }}>
        <div className="section-strip">
          <div className="section-strip-line" />
          <span className="section-strip-icon">{icon}</span>
          <div className="section-strip-title">{title}</div>
          <span className="section-strip-icon">⚽</span>
          <div className="section-strip-line r" />
        </div>

        <div
          className="glass"
          style={{
            padding: "3.5rem 2rem",
            textAlign: "center",
            maxWidth: 720,
            margin: "2rem auto 0",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem", filter: "drop-shadow(0 0 14px rgba(255,184,0,.5))" }}>
            {icon}
          </div>
          <h2
            className="st"
            style={{ fontFamily: "var(--fh)", fontSize: "2.2rem", letterSpacing: ".05em", marginBottom: ".8rem" }}
          >
            {title}
          </h2>
          <p style={{ color: "var(--gray)", fontSize: ".9rem", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 1.8rem" }}>
            {blurb}
          </p>
          <Link className="btn btn-lm" href="/">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
