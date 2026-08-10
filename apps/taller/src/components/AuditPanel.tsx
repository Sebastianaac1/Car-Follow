import { Link } from "react-router-dom";
import { AuthorPill } from "@cf/ui";
import { nextUpcoming, vehicleById } from "@cf/mock-data";
import { useData } from "../store";
import { formatDate, km } from "../format";

const microLabel: React.CSSProperties = {
  fontSize: 10.5,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "var(--cf-dim)",
  marginBottom: 6,
  fontFamily: "'IBM Plex Mono', monospace",
};

export function AuditPanel({ vehicleId }: { vehicleId: string }) {
  const vehicle = vehicleById(vehicleId);
  const { records, recordsByVehicle } = useData();
  const record = recordsByVehicle(vehicleId)[0];
  const upcoming = nextUpcoming(vehicleId, records);

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
        {record?.title ?? "Sin registros"}
      </div>

      {record ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18, fontSize: 12.5 }}>
            <Row label="Fecha" value={formatDate(record.date)} mono />
            <Row label="Kilometraje" value={`${km(record.odometer)} km`} mono />
            <Row
              label="Próximo"
              value={upcoming ? `${upcoming.part} · ${upcoming.remainingLabel}` : "—"}
              mono
              accent
            />
            <Row label="Piezas" value={record.parts.join(", ")} />
          </div>

          <div style={microLabel}>Historial de modificaciones</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {record.revisions.map((rev, i) => (
              <div
                key={rev.id}
                style={{
                  borderLeft: "2px solid var(--cf-border)",
                  paddingLeft: 14,
                  marginLeft: 4,
                  paddingBottom: i === record.revisions.length - 1 ? 0 : 12,
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
                  {rev.timestamp}
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
          Este vehículo aún no tiene trabajos registrados.
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
