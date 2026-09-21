import { Link } from "react-router-dom";
import { AuthorPill } from "@cf/ui";
import type { MaintenanceRecord, UpcomingService, Vehicle } from "@cf/types";
import { formatDate, formatTimestamp, km } from "../format";

/**
 * La ficha lateral del dashboard. Recibe lo que va a mostrar en vez de pedirlo: el
 * dashboard ya trae la flota, el historial y los recordatorios de toda la cartera, así
 * que cambiar de fila seleccionada no dispara ninguna petición nueva.
 */
const microLabel: React.CSSProperties = {
  fontSize: 10.5,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "var(--cf-dim)",
  marginBottom: 6,
  fontFamily: "'IBM Plex Mono', monospace",
};

export function AuditPanel({
  vehicle,
  ultimo,
  proximo,
}: {
  vehicle?: Vehicle;
  ultimo?: MaintenanceRecord;
  proximo?: UpcomingService;
}) {
  return (
    <div style={{ border: "1px solid var(--cf-border)", borderRadius: 16, background: "var(--cf-surface)", padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <div style={microLabel}>Ficha · {vehicle?.name ?? "—"}</div>
        {vehicle && (
          <Link to={`/vehiculos/${vehicle.id}`} style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap" }}>
            Ver ficha completa →
          </Link>
        )}
      </div>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 17, marginBottom: 14 }}>
        {ultimo?.title ?? "Sin registros"}
      </div>

      {ultimo ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18, fontSize: 12.5 }}>
            <Row label="Fecha" value={formatDate(ultimo.date)} mono />
            <Row label="Kilometraje" value={`${km(ultimo.odometer)} km`} mono />
            <Row label="Próximo" value={proximo ? `${proximo.part} · ${proximo.remainingLabel}` : "sin pendientes"} mono accent />
            <Row label="Piezas" value={ultimo.parts.join(", ") || "—"} />
          </div>

          <div style={microLabel}>Historial de modificaciones</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ultimo.revisions.map((rev, i) => (
              <div
                key={rev.id}
                style={{
                  borderLeft: "2px solid var(--cf-border)",
                  paddingLeft: 14,
                  marginLeft: 4,
                  paddingBottom: i === ultimo.revisions.length - 1 ? 0 : 12,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: -5,
                    top: 2,
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: rev.author.role === "taller" ? "var(--cf-accent)" : "var(--cf-persona)",
                  }}
                />
                <div style={{ fontSize: 12 }}>{rev.description}</div>
                <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)", marginTop: 2 }}>
                  {formatTimestamp(rev.timestamp)}
                </div>
                <div style={{ marginTop: 5 }}>
                  <AuthorPill role={rev.author.role} name={rev.author.name} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12.5, color: "var(--cf-dim)" }}>
          {vehicle ? "Este vehículo aún no tiene trabajos registrados." : "Elegí un vehículo de la tabla."}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "var(--cf-dim)" }}>{label}</span>
      <span
        className={mono ? "cf-mono" : undefined}
        style={{ textAlign: "right", color: accent ? "var(--cf-accent)" : "var(--cf-text)" }}
      >
        {value}
      </span>
    </div>
  );
}
