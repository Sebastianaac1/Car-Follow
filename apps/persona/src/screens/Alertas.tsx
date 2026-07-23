import { useNavigate } from "react-router-dom";
import { alerts } from "@cf/mock-data";
import type { Alert } from "@cf/types";

function levelColor(level: Alert["level"]): { color: string; border: string; bg: string } {
  if (level === "vencido")
    return { color: "var(--cf-danger)", border: "var(--cf-danger)", bg: "var(--cf-danger-soft)" };
  if (level === "pronto")
    return { color: "var(--cf-warn)", border: "var(--cf-border)", bg: "var(--cf-surface)" };
  return { color: "var(--cf-text)", border: "var(--cf-border)", bg: "var(--cf-surface)" };
}

export function Alertas() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "14px 20px" }}>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
        Alertas
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {alerts.map((a) => {
          const c = levelColor(a.level);
          return (
            <div key={a.id} style={{ border: `1px solid ${c.border}`, borderRadius: 16, background: c.bg, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: a.level === "info" ? "var(--cf-text)" : c.color }}>
                  {a.title}
                </span>
                <span className="cf-mono" style={{ fontSize: 10.5, color: a.level === "vencido" ? c.color : "var(--cf-dim)" }}>
                  {a.meta ?? a.vehicleName}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--cf-text)", lineHeight: 1.45 }}>{a.body}</div>
              {a.actions && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  {a.actions.map((act) => (
                    <span
                      key={act.label}
                      onClick={() => act.primary && navigate("/registrar")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 10,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: act.primary ? 600 : 400,
                        background: act.primary ? "var(--cf-danger)" : "transparent",
                        color: act.primary ? "var(--cf-on-accent)" : "var(--cf-text)",
                        border: act.primary ? "none" : "1px solid var(--cf-border)",
                      }}
                    >
                      {act.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
