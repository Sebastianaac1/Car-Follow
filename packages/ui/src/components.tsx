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
        background: "var(--cf-accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 30px -8px var(--cf-accent-soft)",
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

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const seg = (on: boolean): CSSProperties => ({
    padding: "7px 14px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: on ? "var(--cf-accent)" : "transparent",
    color: on ? "var(--cf-on-accent)" : "var(--cf-dim)",
  });
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: 5,
        border: "1px solid var(--cf-border)",
        borderRadius: 12,
        background: "var(--cf-surface)",
      }}
    >
      <button onClick={() => setTheme("dark")} style={seg(theme === "dark")}>
        ◑ Oscuro
      </button>
      <button onClick={() => setTheme("light")} style={seg(theme === "light")}>
        ◐ Claro
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
