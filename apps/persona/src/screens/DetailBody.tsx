import { PiArrowLeft } from "react-icons/pi";
import { AuthorPill, Patente, ProgressBar, StatusBadge, tiposDeVehiculo } from "@cf/ui";
import type { MaintenanceRecord, UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { formatDate, km } from "../format";

const colorEstado: Record<UpcomingService["status"], string> = {
  ok: "var(--cf-ok)",
  pronto: "var(--cf-warn)",
  vencido: "var(--cf-danger)",
};

export function DetailBody({ vehicleId, onBack }: { vehicleId: string; onBack?: () => void }) {
  // Tres peticiones porque son tres cosas distintas y esta pantalla las muestra todas.
  // Un vehículo que no es tuyo responde 404 igual que uno que no existe, así que acá no
  // hay forma de distinguirlos — que es exactamente la idea.
  const ficha = useApi<Vehicle>(`/vehiculos/${vehicleId}`);
  const proximos = useApi<UpcomingService[]>(`/vehiculos/${vehicleId}/proximos`);
  const historial = useApi<MaintenanceRecord[]>(`/vehiculos/${vehicleId}/mantenciones`);

  if (ficha.cargando || proximos.cargando || historial.cargando) return <Cargando que="el vehículo" />;
  if (ficha.error) return <ErrorApi mensaje={ficha.error} onReintentar={ficha.recargar} />;
  if (proximos.error) return <ErrorApi mensaje={proximos.error} onReintentar={proximos.recargar} />;
  if (historial.error) return <ErrorApi mensaje={historial.error} onReintentar={historial.recargar} />;

  const vehicle = ficha.datos;
  if (!vehicle) return <p>Vehículo no encontrado.</p>;

  const upcoming = proximos.datos ?? [];
  const records = historial.datos ?? [];
  // La lista viene ordenada por urgencia: el estado del vehículo es el del primero.
  const status = upcoming[0]?.status ?? "ok";
  const { label, Icono } = tiposDeVehiculo[vehicle.kind];

  return (
    <div>
      {onBack && (
        <button className="cf-btn-quieto" onClick={onBack} style={{ height: 34, padding: "0 12px", marginBottom: 20 }}>
          <PiArrowLeft aria-hidden />
          Volver
        </button>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Patente valor={vehicle.plate} alto={34} />
        <StatusBadge status={status} />
      </div>
      <h1 className="cf-display" style={{ fontSize: 40, margin: "12px 0 4px" }}>
        {vehicle.name}
      </h1>
      <div className="cf-num" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: "var(--cf-dim)" }}>
        <Icono aria-hidden size={18} />
        {label}, {km(vehicle.odometer)} km
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 32,
          alignItems: "start",
          marginTop: 32,
        }}
      >
        <section>
          <h2 className="cf-display" style={{ fontSize: 24, margin: "0 0 12px" }}>
            Próximas mantenciones
          </h2>
          {upcoming.length === 0 ? (
            <p style={{ margin: 0, color: "var(--cf-dim)" }}>
              Registra la primera mantención para empezar a contar el intervalo.
            </p>
          ) : (
            <div className="cf-panel cf-lista">
              {upcoming.map((u) => (
                <div key={u.id} style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{u.part}</span>
                    <span className="cf-num" style={{ fontSize: 14, fontWeight: 600, color: colorEstado[u.status], whiteSpace: "nowrap" }}>
                      {u.remainingLabel}
                    </span>
                  </div>
                  <ProgressBar value={Math.min(1, u.progress)} status={u.status} />
                  <div className="cf-num" style={{ fontSize: 13.5, color: "var(--cf-dim)", marginTop: 8 }}>
                    Regla: {u.ruleLabel}. Desde el {formatDate(u.since.date)}, a los {km(u.since.odometer)} km.
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="cf-display" style={{ fontSize: 24, margin: "0 0 12px" }}>
            Historial
          </h2>
          {records.length === 0 ? (
            <p style={{ margin: 0, color: "var(--cf-dim)" }}>Todavía no hay mantenciones registradas.</p>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {records.map((r, i) => (
                <li
                  key={r.id}
                  style={{
                    position: "relative",
                    paddingLeft: 22,
                    paddingBottom: i === records.length - 1 ? 0 : 20,
                    borderLeft: `2px solid ${i === records.length - 1 ? "transparent" : "var(--cf-border)"}`,
                    marginLeft: 5,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: -7,
                      top: 4,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "var(--cf-bg)",
                      border: `3px solid ${r.author.role === "taller" ? "var(--cf-accent)" : "var(--cf-persona)"}`,
                    }}
                  />
                  <div style={{ fontWeight: 600 }}>{r.title}</div>
                  <div className="cf-num" style={{ fontSize: 14, color: "var(--cf-dim)", margin: "2px 0 8px" }}>
                    {formatDate(r.date)}, {km(r.odometer)} km
                  </div>
                  <AuthorPill role={r.author.role} name={r.author.name} />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
