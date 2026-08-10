import { ThemeToggle } from "@cf/ui";
import { workshop } from "@cf/mock-data";

const card: React.CSSProperties = {
  border: "1px solid var(--cf-border)",
  borderRadius: 14,
  background: "var(--cf-surface)",
  padding: 18,
};

export function Ajustes() {
  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Ajustes
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        Configuración del taller y de la cuenta
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Apariencia</div>
          <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 12 }}>Modo claro u oscuro del panel</div>
          <ThemeToggle />
        </div>

        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Plan</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{workshop.plan}</div>
              <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", marginTop: 2 }}>
                Facturación mensual · talleres
              </div>
            </div>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 10,
                background: "var(--cf-accent-soft)",
                color: "var(--cf-accent)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Activo
            </span>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Taller</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--cf-dim)" }}>Nombre</span>
              <span>{workshop.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--cf-dim)" }}>Vehículos activos</span>
              <span className="cf-mono">{workshop.totals.activos}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
