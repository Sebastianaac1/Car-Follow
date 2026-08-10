import type { CSSProperties, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import { workshop } from "@cf/mock-data";
import { useSesion } from "./sesion";

/** Trazos de los iconos de la barra lateral (viewBox 24, stroke currentColor). */
const nav = [
  { label: "Dashboard", path: "/", icon: "M3 12h6v9H3zM10 3h5v18h-5zM16 8h5v13h-5z" },
  { label: "Clientes", path: "/clientes", icon: "M16 20v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
  { label: "Vehículos", path: "/vehiculos", icon: "M5 17h14M4 17v-4l2-5h12l2 5v4M7 17v2M17 17v2M7.5 13h1M15.5 13h1" },
  { label: "Trabajos", path: "/trabajos", icon: "M20 8h-4V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1M9 8V6h6v2" },
  { label: "Recordatorios", path: "/recordatorios", icon: "M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M13.7 20a1.9 1.9 0 0 1-3.4 0" },
];

const ajustesIcon =
  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12a7 7 0 0 0-.1-1.1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.9-1.1L14.2 3H9.8l-.4 2.8a7 7 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.9 1.1l.4 2.8h4.4l.4-2.8a7 7 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.6c.06-.36.1-.73.1-1.1";

function Icon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden>
      <path d={d} />
    </svg>
  );
}

const salirIcon = "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9";

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sesion, salir } = useSesion();

  const navItem = (active: boolean): CSSProperties => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 13.5,
    color: active ? "var(--cf-accent)" : "var(--cf-dim)",
    fontWeight: active ? 600 : 500,
    background: active ? "var(--cf-accent-soft)" : "transparent",
  });

  // El dashboard vive en "/", así que solo él compara por igualdad: el resto
  // tiene que seguir activo en sus subrutas (/vehiculos/:id).
  const item = (label: string, path: string, icon: string) => {
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return (
      <button
        key={path}
        onClick={() => navigate(path)}
        className="cf-tap"
        style={{ ...navItem(active), border: "none", width: "100%", textAlign: "left", fontFamily: "inherit" }}
        aria-current={active ? "page" : undefined}
      >
        {active && (
          <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 99, background: "var(--cf-accent)" }} />
        )}
        <Icon d={icon} />
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--cf-bg)", color: "var(--cf-text)", overflow: "hidden" }}>
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          background: "var(--cf-surface)",
          borderRight: "1px solid var(--cf-border)",
          padding: "20px 14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 8px", marginBottom: 22 }}>
          <Logo size={34} radius={10} font={14} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {workshop.name}
            </div>
            <span
              className="cf-mono"
              style={{
                display: "inline-block",
                marginTop: 3,
                padding: "1px 7px",
                borderRadius: 99,
                fontSize: 9.5,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                background: "var(--cf-accent-soft)",
                color: "var(--cf-accent)",
              }}
            >
              {workshop.plan}
            </span>
          </div>
        </div>

        <div className="cf-mono" style={{ padding: "0 12px 8px", fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: "var(--cf-dim)" }}>
          Operación
        </div>
        {nav.map((n) => item(n.label, n.path, n.icon))}

        <div style={{ flex: 1 }} />

        <div style={{ padding: "0 4px 12px" }}>
          <ThemeToggle />
        </div>
        {item("Ajustes", "/ajustes", ajustesIcon)}

        <div style={{ borderTop: "1px solid var(--cf-border)", marginTop: 8, paddingTop: 10 }}>
          <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)", padding: "0 12px 6px", wordBreak: "break-all" }}>
            {sesion?.email}
          </div>
          <button
            onClick={salir}
            className="cf-tap"
            style={{ ...navItem(false), border: "none", width: "100%", textAlign: "left", fontFamily: "inherit" }}
          >
            <Icon d={salirIcon} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px 40px", minWidth: 0 }}>
        <div style={{ maxWidth: 1280 }}>{children}</div>
      </main>
    </div>
  );
}
