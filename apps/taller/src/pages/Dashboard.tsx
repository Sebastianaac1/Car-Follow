import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@cf/ui";
import { nextUpcoming, vehicles, vehicleStatus, workshop } from "@cf/mock-data";
import { useData } from "../store";
import { AuditPanel } from "../components/AuditPanel";

const gridCols = "1.4fr 1fr 1.1fr 0.8fr";

export function Dashboard() {
  const navigate = useNavigate();
  const { records } = useData();
  const [selected, setSelected] = useState("hilux");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = vehicles
    .filter((v) => !q || `${v.name} ${v.plate} ${v.ownerName}`.toLowerCase().includes(q))
    .map((v) => ({ vehicle: v, next: nextUpcoming(v.id, records), status: vehicleStatus(v.id, records) }))
    .sort((a, b) => (b.next?.progress ?? 0) - (a.next?.progress ?? 0));

  // Si el filtro deja fuera al vehículo seleccionado, la ficha pasa a la primera
  // fila visible en vez de quedar mostrando algo que ya no está en la tabla.
  const enFicha = rows.some((r) => r.vehicle.id === selected) ? selected : rows[0]?.vehicle.id ?? "";

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 24 }}>
        <div>
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-.3px" }}>
            Vehículos en seguimiento
          </div>
          <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginTop: 4 }}>
            {workshop.totals.activos} activos · {workshop.totals.pendientes} con mantención pendiente
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <input
            className="cf-input cf-mono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar patente…"
            aria-label="Buscar por patente, vehículo o cliente"
            style={{ padding: "9px 14px", borderRadius: 10, fontSize: 13, width: 190 }}
          />
          <button
            className="cf-btn"
            onClick={() => navigate("/trabajos")}
            style={{ padding: "9px 16px", borderRadius: 10, fontSize: 13, whiteSpace: "nowrap" }}
          >
            + Registrar trabajo
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <Kpi label="Pendientes hoy" value={workshop.kpis.pendientesHoy} color="var(--cf-warn)" />
        <Kpi label="Vencidos" value={workshop.kpis.vencidos} color="var(--cf-danger)" />
        <Kpi label="Trabajos este mes" value={workshop.kpis.trabajosMes} color="var(--cf-ok)" />
      </div>

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
        <div style={{ flex: 1.4, minWidth: 0 }}>
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
            {rows.map(({ vehicle, next, status }) => {
              const active = enFicha === vehicle.id;
              return (
                <div
                  key={vehicle.id}
                  className="cf-tap"
                  onClick={() => setSelected(vehicle.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    alignItems: "center",
                    padding: "12px 14px",
                    border: `1px solid ${active ? "var(--cf-accent)" : "var(--cf-border)"}`,
                    borderRadius: 12,
                    background: active ? "var(--cf-accent-soft)" : "var(--cf-surface)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{vehicle.name}</div>
                    <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)" }}>
                      {vehicle.plate}
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5 }}>{vehicle.ownerName}</span>
                  <span className="cf-mono" style={{ fontSize: 11.5 }}>
                    {next ? `${next.part} · ${next.remainingLabel}` : "sin registros"}
                  </span>
                  <StatusBadge status={status} />
                </div>
              );
            })}
            {rows.length === 0 && (
              <div style={{ padding: "28px 14px", textAlign: "center", fontSize: 13, color: "var(--cf-dim)" }}>
                Ningún vehículo coincide con “{query}”.
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <AuditPanel vehicleId={enFicha} />
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        border: "1px solid var(--cf-border)",
        borderRadius: 14,
        padding: "15px 18px",
        background: "var(--cf-surface)",
        overflow: "hidden",
      }}
    >
      <span style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, borderRadius: 99, background: color }} />
      <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)" }}>
        {label}
      </div>
      <div className="cf-display" style={{ fontWeight: 700, fontSize: 28, marginTop: 4, color }}>
        {value}
      </div>
    </div>
  );
}
