import { Link } from "react-router-dom";
import { AuthorPill, Patente } from "@cf/ui";
import type { MaintenanceRecord, UpcomingService, Vehicle } from "@cf/types";
import { formatDate, formatTimestamp, km, loQueViene } from "../format";

/**
 * La ficha lateral del resumen. Recibe lo que va a mostrar en vez de pedirlo: el resumen
 * ya trae la flota, el historial y los recordatorios de toda la cartera, así que cambiar
 * de fila seleccionada no dispara ninguna petición nueva.
 */
export function AuditPanel({
  vehicle,
  ultimo,
  proximo,
}: {
  vehicle?: Vehicle;
  ultimo?: MaintenanceRecord;
  proximo?: UpcomingService;
}) {
  if (!vehicle) {
    return (
      <div className="cf-panel" style={{ padding: 20, color: "var(--cf-dim)" }}>
        Elige un vehículo de la tabla.
      </div>
    );
  }

  return (
    <div className="cf-panel" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <Patente valor={vehicle.plate} alto={28} />
        <Link to={`/vehiculos/${vehicle.id}`} style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap" }}>
          Abrir ficha
        </Link>
      </div>
      <div style={{ fontWeight: 600, fontSize: 17, margin: "10px 0 16px" }}>{vehicle.name}</div>

      <h2 style={{ fontSize: 13, fontWeight: 500, color: "var(--cf-dim)", margin: "0 0 4px" }}>Último trabajo</h2>
      {ultimo ? (
        <>
          <div className="cf-display" style={{ fontSize: 24, marginBottom: 12 }}>
            {ultimo.title}
          </div>
          <dl className="cf-num" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: "0 0 20px", fontSize: 14.5 }}>
            <dt style={{ color: "var(--cf-dim)" }}>Fecha</dt>
            <dd style={{ margin: 0, textAlign: "right" }}>{formatDate(ultimo.date)}</dd>
            <dt style={{ color: "var(--cf-dim)" }}>Kilometraje</dt>
            <dd style={{ margin: 0, textAlign: "right" }}>{km(ultimo.odometer)} km</dd>
            <dt style={{ color: "var(--cf-dim)" }}>Lo que viene</dt>
            <dd style={{ margin: 0, textAlign: "right", fontWeight: 600, color: proximo ? "var(--cf-text)" : "var(--cf-dim)" }}>
              {proximo ? loQueViene(proximo) : "Sin pendientes"}
            </dd>
            <dt style={{ color: "var(--cf-dim)" }}>Piezas</dt>
            <dd style={{ margin: 0, textAlign: "right" }}>{ultimo.parts.join(", ") || "Ninguna"}</dd>
          </dl>

          {/* Audit trail: cada modificación queda firmada, nada se sobrescribe. */}
          <h2 style={{ fontSize: 13, fontWeight: 500, color: "var(--cf-dim)", margin: "0 0 10px" }}>Cambios firmados</h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {ultimo.revisions.map((rev) => (
              <li key={rev.id}>
                <div style={{ fontSize: 14.5 }}>{rev.description}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  <AuthorPill role={rev.author.role} name={rev.author.name} />
                  <span className="cf-num" style={{ fontSize: 13, color: "var(--cf-dim)" }}>
                    {formatTimestamp(rev.timestamp)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p style={{ margin: 0, color: "var(--cf-dim)" }}>Este vehículo aún no tiene trabajos registrados.</p>
      )}
    </div>
  );
}
