import { AuthorPill, ProgressBar, StatusBadge } from "@cf/ui";
import type { MaintenanceRecord, UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { formatDate, km } from "../format";

/* La cabecera va sin silueta del tipo de vehículo, a diferencia de las tarjetas
   del garaje: acá el nombre del vehículo ya domina y no hay nada que aclarar. */
const cabecera = "linear-gradient(135deg, var(--cf-surface-2), var(--cf-surface))";

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "var(--cf-dim)",
  marginBottom: 10,
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
  if (!vehicle) return <div style={{ padding: 20 }}>Vehículo no encontrado.</div>;

  const upcoming = proximos.datos ?? [];
  const records = historial.datos ?? [];
  // La lista viene ordenada por urgencia: el estado del vehículo es el del primero.
  const status = upcoming[0]?.status ?? "ok";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 120,
          background: cabecera,
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: "14px 20px",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Volver"
            className="cf-tap"
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--cf-border)",
              borderRadius: 9,
              background: "var(--cf-surface)",
              color: "var(--cf-text)",
              fontSize: 17,
              lineHeight: 1,
            }}
          >
            ‹
          </button>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: "100%", gap: 10 }}>
          <div>
            <div className="cf-display" style={{ fontWeight: 600, fontSize: 20 }}>
              {vehicle.name}
            </div>
            <div className="cf-mono" style={{ fontSize: 12, color: "var(--cf-dim)" }}>
              {vehicle.plate} · {km(vehicle.odometer)} km
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <div style={sectionLabel}>Próximos mantenimientos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {upcoming.map((u) => (
            <div
              key={u.id}
              style={{
                border: "1px solid var(--cf-border)",
                borderRadius: 14,
                background: "var(--cf-surface)",
                padding: "11px 13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 13.5 }}>{u.part}</span>
                <span
                  className="cf-mono"
                  style={{
                    fontSize: 11,
                    color: u.status === "ok" ? "var(--cf-ok)" : u.status === "pronto" ? "var(--cf-warn)" : "var(--cf-danger)",
                  }}
                >
                  {u.remainingLabel}
                </span>
              </div>
              <ProgressBar value={Math.min(1, u.progress)} status={u.status} height={5} />
              <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)", marginTop: 6 }}>
                {u.ruleLabel}
              </div>
              <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)", marginTop: 3 }}>
                desde {formatDate(u.since.date)} · {km(u.since.odometer)} km
              </div>
            </div>
          ))}
          {upcoming.length === 0 && (
            <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)" }}>
              Registra la primera mantención para empezar a contar el intervalo.
            </div>
          )}
        </div>

        <div style={sectionLabel}>Historial</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {records.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                gap: 11,
                paddingBottom: i === records.length - 1 ? 0 : 14,
                borderLeft: "2px solid var(--cf-border)",
                marginLeft: 5,
                paddingLeft: 16,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: -6,
                  top: 2,
                  width: 10,
                  height: 10,
                  borderRadius: 99,
                  background: r.author.role === "taller" ? "var(--cf-accent)" : "var(--cf-persona)",
                  border: "2px solid var(--cf-bg)",
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</div>
                <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)", marginTop: 3 }}>
                  {formatDate(r.date)} · {km(r.odometer)} km
                </div>
                <div style={{ marginTop: 7 }}>
                  <AuthorPill role={r.author.role} name={r.author.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
