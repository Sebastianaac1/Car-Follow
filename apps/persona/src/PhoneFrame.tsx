import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { key: "garaje", label: "Garaje", path: "/" },
  { key: "historial", label: "Historial", path: "/historial" },
  { key: "alertas", label: "Alertas", path: "/alertas" },
  { key: "perfil", label: "Perfil", path: "/perfil" },
];

function activeTab(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/vehiculo") || pathname === "/registrar")
    return pathname.startsWith("/historial") ? "historial" : "garaje";
  if (pathname.startsWith("/historial")) return "historial";
  if (pathname.startsWith("/alertas")) return "alertas";
  if (pathname.startsWith("/perfil")) return "perfil";
  return "garaje";
}

export function PhoneFrame({ children, showTabs = true }: { children: ReactNode; showTabs?: boolean }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = activeTab(pathname);

  return (
    <div
      style={{
        width: 288,
        background: "var(--cf-surface)",
        border: "1px solid var(--cf-border)",
        borderRadius: 36,
        padding: 9,
        boxShadow: "0 30px 70px -24px rgba(0,0,0,.55)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          background: "var(--cf-bg)",
          borderRadius: 28,
          overflow: "hidden",
          height: 604,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 22px 6px",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--cf-text)",
          }}
        >
          <span>9:41</span>
          <span style={{ width: 52, height: 6, borderRadius: 99, background: "var(--cf-dim)", opacity: 0.5 }} />
          <span className="cf-mono">100%</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>{children}</div>

        {showTabs && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "13px 16px 20px",
              borderTop: "1px solid var(--cf-border)",
              fontSize: 11,
              color: "var(--cf-dim)",
            }}
          >
            {tabs.map((t) => {
              const on = current === t.key;
              return (
                <span
                  key={t.key}
                  onClick={() => navigate(t.path)}
                  style={{
                    cursor: "pointer",
                    color: on ? "var(--cf-accent)" : "var(--cf-dim)",
                    fontWeight: on ? 600 : 400,
                  }}
                >
                  {t.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
