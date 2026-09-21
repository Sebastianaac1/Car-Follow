import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@cf/ui";
import type { MaintenanceRecord, UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { AuditPanel } from "../components/AuditPanel";

const gridCols = "1.4fr 1fr 1.1fr 0.8fr";

/** Prefijo AAAA-MM del mes corriente, en hora local: es el mes que cuenta quien mira. */
function mesActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Tres peticiones para todo el panel, no una por vehículo: las tres rutas ya vienen
  // filtradas por el taller de la sesión. Una cartera de cien autos sigue siendo tres
  // llamadas.
  const flota = useApi<Vehicle[]>("/taller/vehiculos");
  const pendientes = useApi<UpcomingService[]>("/taller/recordatorios");
  const trabajos = useApi<MaintenanceRecord[]>("/taller/trabajos");

  if (flota.cargando || pendientes.cargando || trabajos.cargando) return <Cargando que="la cartera del taller" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (pendientes.error) return <ErrorApi mensaje={pendientes.error} onReintentar={pendientes.recargar} />;
  if (trabajos.error) return <ErrorApi mensaje={trabajos.error} onReintentar={trabajos.recargar} />;

  const vehiculos = flota.datos ?? [];
  const recordatorios = pendientes.datos ?? [];
  const historial = trabajos.datos ?? [];

  // Los cuatro números salen de estas mismas tres listas: no hay ningún contador guardado
  // que pueda quedar desincronizado de los datos que se ven abajo.
  const vencidos = recordatorios.filter((u) => u.status === "vencido").length;
  const proximos = recordatorios.filter((u) => u.status === "pronto").length;
  const conPendiente = new Set(recordatorios.map((u) => u.vehicleId)).size;
  const mes = mesActual();
  const trabajosDelMes = historial.filter((r) => r.date.startsWith(mes)).length;

  const q = query.trim().toLowerCase();
  const rows = vehiculos
    .filter((v) => !q || `${v.name} ${v.plate} ${v.ownerName}`.toLowerCase().includes(q))
    // El servidor manda los recordatorios ordenados por urgencia, así que el primero que
    // coincide con este vehículo ya es el peor: no hay que recalcular nada.
    .map((v) => ({ vehicle: v, next: recordatorios.find((u) => u.vehicleId === v.id) }))
    .sort((a, b) => (b.next?.progress ?? 0) - (a.next?.progress ?? 0));

  // Si el filtro deja fuera al vehículo seleccionado, la ficha pasa a la primera
  // fila visible en vez de quedar mostrando algo que ya no está en la tabla.
  const enFicha = rows.some((r) => r.vehicle.id === selected) ? selected : rows[0]?.vehicle.id ?? null;
  const vehiculoEnFicha = vehiculos.find((v) => v.id === enFicha);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-.3px" }}>
            Vehículos en seguimiento
          </div>
          <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginTop: 4 }}>
            {vehiculos.length} activos · {conPendiente} con mantención pendiente
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

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <Kpi label="Por vencer" value={proximos} color="var(--cf-warn)" />
        <Kpi label="Vencidos" value={vencidos} color="var(--cf-danger)" />
        <Kpi label="Trabajos este mes" value={trabajosDelMes} color="var(--cf-ok)" />
      </div>

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1.4 1 420px", minWidth: 0 }}>
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
            {rows.map(({ vehicle, next }) => {
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
                    {next ? `${next.part} · ${next.remainingLabel}` : "sin pendientes"}
                  </span>
                  <StatusBadge status={next?.status ?? "ok"} />
                </div>
              );
            })}
            {rows.length === 0 && (
              <div style={{ padding: "28px 14px", textAlign: "center", fontSize: 13, color: "var(--cf-dim)", lineHeight: 1.6 }}>
                {vehiculos.length === 0 ? (
                  <>
                    Todavía no hay vehículos en seguimiento.
                    <br />
                    Cargá un cliente en <strong style={{ color: "var(--cf-accent)" }}>Clientes</strong> y después su
                    vehículo.
                  </>
                ) : (
                  <>Ningún vehículo coincide con “{query}”.</>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: "1 1 300px", minWidth: 0 }}>
          {/* La ficha no pide nada más: el último trabajo y el próximo servicio ya están
              en las listas de arriba, así que seleccionar una fila no dispara una
              petición nueva. */}
          <AuditPanel
            vehicle={vehiculoEnFicha}
            ultimo={historial.find((r) => r.vehicleId === enFicha)}
            proximo={recordatorios.find((u) => u.vehicleId === enFicha)}
          />
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        flex: "1 1 160px",
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
