const repo = "https://github.com/Sebastianaac1/Car-Follow";

const claves = [
  {
    titulo: "Historial firmado, nada se sobrescribe",
    texto: "Cada corrección se agrega como una revisión con su autor. Persona en azul, taller en naranja.",
    icon: "M9 12l2 2 4-4M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7z",
  },
  {
    titulo: "Alertas por kilometraje o tiempo",
    texto: "Cada pieza tiene su regla: lo que ocurra primero dispara el recordatorio.",
    icon: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18",
  },
  {
    titulo: "Dos apps, un design system",
    texto: "Monorepo con tokens, tema claro/oscuro y componentes compartidos entre la app y el panel.",
    icon: "M3 7h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 17h7v4H3z",
  },
];

const stack = ["React 18", "TypeScript", "Vite", "pnpm workspaces", "Turborepo"];

export function Presentacion() {
  return (
    <div className="cf-presentacion">
      <span
        className="cf-mono"
        style={{
          display: "inline-block",
          padding: "5px 11px",
          borderRadius: 99,
          border: "1px solid var(--cf-border)",
          background: "var(--cf-surface)",
          fontSize: 10.5,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "var(--cf-accent)",
          marginBottom: 16,
        }}
      >
        Prototipo navegable
      </span>

      <h1 className="cf-display" style={{ margin: 0, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.08, letterSpacing: "-1px" }}>
        Un solo historial de mantención,
        <br />
        <span style={{ color: "var(--cf-accent)" }}>dos formas de usarlo.</span>
      </h1>

      <p style={{ margin: "14px 0 20px", fontSize: 14.5, lineHeight: 1.55, color: "var(--cf-dim)", maxWidth: 460 }}>
        La persona registra lo que le hace a su vehículo y el taller registra lo que le hizo. Ambos escriben sobre
        el mismo historial y cada cambio queda firmado por quien lo hizo.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
        {claves.map((c) => (
          <div key={c.titulo} style={{ display: "flex", gap: 13 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: 9,
                background: "var(--cf-accent-soft)",
                color: "var(--cf-accent)",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={c.icon} />
              </svg>
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.titulo}</div>
              <div style={{ fontSize: 13, color: "var(--cf-dim)", marginTop: 3, lineHeight: 1.5, maxWidth: 420 }}>{c.texto}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
        {stack.map((s) => (
          <span
            key={s}
            className="cf-mono"
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              border: "1px solid var(--cf-border)",
              background: "var(--cf-surface)",
              fontSize: 11,
              color: "var(--cf-dim)",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <a
          className="cf-btn"
          href="http://localhost:5174"
          style={{ padding: "11px 18px", borderRadius: 11, fontSize: 13.5, color: "var(--cf-on-accent)" }}
        >
          Abrir el panel del taller →
        </a>
        <a
          href={repo}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "11px 18px",
            borderRadius: 11,
            fontSize: 13.5,
            fontWeight: 600,
            border: "1px solid var(--cf-border)",
            background: "var(--cf-surface)",
            color: "var(--cf-text)",
          }}
        >
          Ver el código
        </a>
      </div>
    </div>
  );
}
