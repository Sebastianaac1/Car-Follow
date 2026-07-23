import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@cf/ui";
import { vehicleById, workshop, workshopRows } from "@cf/mock-data";
import { AuditPanel } from "../components/AuditPanel";

const gridCols = "1.4fr 1fr 1fr 0.8fr";

export function Dashboard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("hilux");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 24 }}>
            Vehículos en seguimiento
          </div>
          <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginTop: 3 }}>
            {workshop.totals.activos} activos · {workshop.totals.pendientes} con mantención pendiente
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span
            className="cf-mono"
            style={{ padding: "9px 14px", border: "1px solid var(--cf-border)", borderRadius: 10, fontSize: 13, color: "var(--cf-dim)" }}
          >
            Buscar patente…
          </span>
          <button
            onClick={() => navigate("/trabajos")}
            style={{
              padding: "9px 16px",
              background: "var(--cf-accent)",
              color: "var(--cf-on-accent)",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Registrar trabajo
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
        <Kpi label="Pendientes hoy" value={workshop.kpis.pendientesHoy} />
        <Kpi label="Vencidos" value={workshop.kpis.vencidos} color="var(--cf-danger)" />
        <Kpi label="Trabajos este mes" value={workshop.kpis.trabajosMes} />
      </div>

      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ flex: 1.4 }}>
          <div
            className="cf-mono"
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              padding: "0 14px 10px",
              fontSize: 10.5,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: "var(--cf-dim)",
            }}
          >
            <span>Vehículo</span>
            <span>Cliente</span>
            <span>Próximo</span>
            <span>Estado</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {workshopRows.map((row) => {
              const v = vehicleById(row.vehicleId)!;
              const active = selected === row.vehicleId;
              return (
                <div
                  key={row.vehicleId}
                  onClick={() => setSelected(row.vehicleId)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    alignItems: "center",
                    padding: "12px 14px",
                    border: `1px solid ${active ? "var(--cf-accent)" : "var(--cf-border)"}`,
                    borderRadius: 12,
                    background: active ? "var(--cf-accent-soft)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v.name}</div>
                    <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)" }}>
                      {v.plate}
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5 }}>{v.ownerName}</span>
                  <span className="cf-mono" style={{ fontSize: 11.5 }}>
                    {row.next}
                  </span>
                  <StatusBadge status={v.status} />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <AuditPanel vehicleId={selected} />
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ flex: 1, border: "1px solid var(--cf-border)", borderRadius: 14, padding: "14px 16px", background: "var(--cf-bg)" }}>
      <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)" }}>
        {label}
      </div>
      <div className="cf-display" style={{ fontWeight: 700, fontSize: 26, marginTop: 4, color: color ?? "var(--cf-text)" }}>
        {value}
      </div>
    </div>
  );
}
