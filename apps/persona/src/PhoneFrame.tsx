import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Trazos de los iconos de la tab bar (viewBox 24, stroke currentColor). */
const tabs = [
  { key: "garaje", label: "Garaje", path: "/", icon: "M5 17h14M4 17v-4l2-5h12l2 5v4M7 17v2M17 17v2M7.5 13h1M15.5 13h1" },
  { key: "historial", label: "Historial", path: "/historial", icon: "M12 7v5l3 2M3.4 9a9 9 0 1 0 2.2-3.6L3 8m0 0V4m0 4h4" },
  { key: "alertas", label: "Alertas", path: "/alertas", icon: "M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M13.7 20a1.9 1.9 0 0 1-3.4 0" },
  { key: "perfil", label: "Perfil", path: "/perfil", icon: "M16 20v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
];

function activeTab(pathname: string): string {
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
    <div className="cf-telefono">
      <div className="cf-telefono-pantalla">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 24px 4px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--cf-text)",
            flexShrink: 0,
          }}
        >
          <span>9:41</span>
          <span className="cf-isla" />
          <span className="cf-mono" style={{ fontSize: 11 }}>
            100%
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>{children}</div>

        {showTabs && (
          <nav
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "9px 10px 14px",
              borderTop: "1px solid var(--cf-border)",
              background: "var(--cf-surface)",
              flexShrink: 0,
            }}
          >
            {tabs.map((t) => {
              const on = current === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => navigate(t.path)}
                  aria-current={on ? "page" : undefined}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 12px",
                    border: "none",
                    borderRadius: 10,
                    background: on ? "var(--cf-accent-soft)" : "transparent",
                    color: on ? "var(--cf-accent)" : "var(--cf-dim)",
                    fontSize: 10,
                    fontWeight: on ? 600 : 500,
                    cursor: "pointer",
                    transition: "background .15s ease, color .15s ease",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={t.icon} />
                  </svg>
                  {t.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
