import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "./ThemeProvider";

type Status = "ok" | "pronto" | "vencido";

export const statusMeta: Record<Status, { label: string; color: string; soft: string }> = {
  ok: { label: "Al día", color: "var(--cf-ok)", soft: "var(--cf-ok-soft)" },
  pronto: { label: "Pronto", color: "var(--cf-warn)", soft: "var(--cf-warn-soft)" },
  vencido: { label: "Vencido", color: "var(--cf-danger)", soft: "var(--cf-danger-soft)" },
};

export function Logo({ size = 64, radius = 18, font = 26 }: { size?: number; radius?: number; font?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(150deg, var(--cf-accent), color-mix(in srgb, var(--cf-accent) 72%, #b91c1c))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 ${Math.round(size / 5)}px ${Math.round(size / 2)}px -${Math.round(size / 5)}px rgba(249,115,22,.55)`,
        flexShrink: 0,
      }}
    >
      <span
        className="cf-display"
        style={{ fontWeight: 700, fontSize: font, color: "var(--cf-on-accent)", letterSpacing: "-.5px" }}
      >
        CF
      </span>
    </div>
  );
}

const sunPath = "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4";
const moonPath = "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const seg = (on: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 26,
    borderRadius: 7,
    cursor: "pointer",
    border: "none",
    background: on ? "var(--cf-accent)" : "transparent",
    color: on ? "var(--cf-on-accent)" : "var(--cf-dim)",
    transition: "background .15s ease, color .15s ease",
  });
  const icon = (d: string) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
  return (
    <div
      role="group"
      aria-label="Tema"
      style={{
        display: "inline-flex",
        gap: 3,
        padding: 3,
        border: "1px solid var(--cf-border)",
        borderRadius: 10,
        background: "var(--cf-bg)",
      }}
    >
      <button onClick={() => setTheme("dark")} style={seg(theme === "dark")} aria-label="Tema oscuro" aria-pressed={theme === "dark"}>
        {icon(moonPath)}
      </button>
      <button onClick={() => setTheme("light")} style={seg(theme === "light")} aria-label="Tema claro" aria-pressed={theme === "light"}>
        {icon(sunPath)}
      </button>
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const m = statusMeta[status];
  return (
    <span
      style={{
        padding: "4px 9px",
        borderRadius: 99,
        background: m.soft,
        color: m.color,
        fontSize: 11,
        fontWeight: 600,
        width: "fit-content",
      }}
    >
      {m.label}
    </span>
  );
}

export function ProgressBar({ value, status, height = 6 }: { value: number; status: Status; height?: number }) {
  const color = statusMeta[status].color;
  return (
    <div style={{ height, borderRadius: 99, background: "var(--cf-surface-2)" }}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
          height: "100%",
          borderRadius: 99,
          background: color,
          transition: "width .3s ease",
        }}
      />
    </div>
  );
}

export function AuthorPill({ role, name }: { role: "persona" | "taller"; name: string }) {
  const color = role === "persona" ? "var(--cf-persona)" : "var(--cf-accent)";
  const soft = role === "persona" ? "var(--cf-persona-soft)" : "var(--cf-accent-soft)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 99,
        background: soft,
        fontSize: 10.5,
        color,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 99, background: color }} />
      {name}
    </span>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        border: "1px solid var(--cf-border)",
        borderRadius: 16,
        background: "var(--cf-surface)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
