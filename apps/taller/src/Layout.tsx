import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import { workshop } from "@cf/mock-data";

const nav = [
  { label: "Dashboard", path: "/" },
  { label: "Clientes", path: "/clientes" },
  { label: "Vehículos", path: "/vehiculos" },
  { label: "Trabajos", path: "/trabajos" },
  { label: "Recordatorios", path: "/recordatorios" },
];

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItem = (active: boolean): React.CSSProperties => ({
    padding: "9px 12px",
    borderRadius: 9,
    fontSize: 13.5,
    cursor: "pointer",
    color: active ? "var(--cf-text)" : "var(--cf-dim)",
    fontWeight: active ? 600 : 400,
    background: active ? "var(--cf-accent-soft)" : "transparent",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--cf-bg)", color: "var(--cf-text)", padding: 24 }}>
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          border: "1px solid var(--cf-border)",
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--cf-surface)",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{
            height: 42,
            background: "var(--cf-surface-2)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
            borderBottom: "1px solid var(--cf-border)",
          }}
        >
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#ff5f57" }} />
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#febc2e" }} />
          <span style={{ width: 11, height: 11, borderRadius: 99, background: "#28c840" }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <span
              className="cf-mono"
              style={{ fontSize: 11.5, color: "var(--cf-dim)", background: "var(--cf-bg)", padding: "5px 16px", borderRadius: 8 }}
            >
              app.carfollow.io/taller
            </span>
          </div>
        </div>

        <div style={{ display: "flex", minHeight: 620 }}>
          <div
            style={{
              width: 210,
              background: "var(--cf-bg)",
              borderRight: "1px solid var(--cf-border)",
              padding: "18px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", marginBottom: 14 }}>
              <Logo size={32} radius={9} font={14} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{workshop.name}</div>
                <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)" }}>
                  {workshop.plan}
                </div>
              </div>
            </div>
            {nav.map((n) => (
              <div key={n.path} onClick={() => navigate(n.path)} style={navItem(pathname === n.path)}>
                {n.label}
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ padding: "0 4px 10px" }}>
              <ThemeToggle />
            </div>
            <div onClick={() => navigate("/ajustes")} style={navItem(pathname === "/ajustes")}>
              Ajustes
            </div>
          </div>

          <div style={{ flex: 1, padding: "24px 28px", overflow: "hidden" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
