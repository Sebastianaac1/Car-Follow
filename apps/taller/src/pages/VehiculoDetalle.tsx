import { Link, useNavigate, useParams } from "react-router-dom";
import { PiArrowLeft, PiPhone, PiPlus, PiSpeedometer, PiUser, PiWhatsappLogo } from "react-icons/pi";
import { AuthorPill, Patente, ProgressBar, StatusBadge, tiposDeVehiculo } from "@cf/ui";
import type { Client, MaintenanceRecord, UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { formatDate, formatTimestamp, km } from "../format";

// Pasa las 200 líneas a propósito: es una ficha, o sea una sola cosa mostrada entera.
// Lo que la hace larga son los estilos inline de cada bloque, no ramas de lógica.

const colorEstado: Record<UpcomingService["status"], string> = {
  ok: "var(--cf-ok)",
  pronto: "var(--cf-warn)",
  vencido: "var(--cf-danger)",
};

const subtitulo: React.CSSProperties = { fontSize: 24, margin: "0 0 12px" };

export function VehiculoDetalle() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  // Un vehículo que no es de esta cartera responde 404 igual que uno que no existe, así
  // que acá no hay forma de distinguirlos — que es exactamente la idea.
  const ficha = useApi<Vehicle>(`/taller/vehiculos/${id}`);
  const proximos = useApi<UpcomingService[]>(`/taller/vehiculos/${id}/proximos`);
  const historial = useApi<MaintenanceRecord[]>(`/taller/vehiculos/${id}/mantenciones`);
  const cartera = useApi<Client[]>("/taller/clientes");

  if (ficha.cargando || proximos.cargando || historial.cargando || cartera.cargando)
    return <Cargando que="el vehículo" />;

  if (ficha.error) {
    return (
      <>
        <h1 className="cf-display" style={{ fontSize: 32, margin: "0 0 6px" }}>
          Vehículo no encontrado
        </h1>
        <p style={{ color: "var(--cf-dim)", margin: "0 0 18px" }}>{ficha.error}</p>
        <Link to="/vehiculos">Volver a Vehículos</Link>
      </>
    );
  }
  if (proximos.error) return <ErrorApi mensaje={proximos.error} onReintentar={proximos.recargar} />;
  if (historial.error) return <ErrorApi mensaje={historial.error} onReintentar={historial.recargar} />;
  if (cartera.error) return <ErrorApi mensaje={cartera.error} onReintentar={cartera.recargar} />;

  const vehicle = ficha.datos!;
  const upcoming = proximos.datos ?? [];
  const history = historial.datos ?? [];
  const client = (cartera.datos ?? []).find((c) => c.id === vehicle.ownerId);
  const telefono = client?.phone.replace(/\D/g, "") ?? "";
  const { label, Icono } = tiposDeVehiculo[vehicle.kind];

  // La lista viene ordenada por urgencia: el estado del vehículo es el del peor pendiente.
  const estado = upcoming.find((u) => u.status !== "ok")?.status ?? "ok";

  return (
    <>
      <Link
        to="/vehiculos"
        className="cf-btn-quieto"
        style={{ display: "inline-flex", height: 34, padding: "0 12px", marginBottom: 20, fontSize: 14 }}
      >
        <PiArrowLeft aria-hidden />
        Vehículos
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Patente valor={vehicle.plate} alto={36} />
            <StatusBadge status={estado} />
          </div>
          <h1 className="cf-display" style={{ fontSize: 44, margin: "12px 0 8px" }}>
            {vehicle.name}
          </h1>
          <div className="cf-num" style={{ display: "flex", gap: 18, flexWrap: "wrap", color: "var(--cf-dim)" }}>
            {[
              { Icono, texto: label },
              { Icono: PiSpeedometer, texto: `${km(vehicle.odometer)} km` },
              { Icono: PiUser, texto: vehicle.ownerName },
            ].map(({ Icono: I, texto }) => (
              <span key={texto} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <I aria-hidden size={18} />
                {texto}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {telefono && (
            <>
              <a className="cf-btn-quieto" href={`tel:${telefono}`}>
                <PiPhone aria-hidden />
                Llamar
              </a>
              <a className="cf-btn-quieto" href={`https://wa.me/${telefono}`} target="_blank" rel="noreferrer">
                <PiWhatsappLogo aria-hidden />
                WhatsApp
              </a>
            </>
          )}
          <button className="cf-btn" onClick={() => navigate(`/trabajos?vehiculo=${vehicle.id}`)}>
            <PiPlus aria-hidden />
            Registrar trabajo
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 32, alignItems: "start" }}>
        <div>
          <section>
            <h2 className="cf-display" style={subtitulo}>
              Próximas mantenciones
            </h2>
            {upcoming.length === 0 ? (
              <p style={{ margin: 0, color: "var(--cf-dim)" }}>Registra el primer trabajo para empezar a contar los intervalos.</p>
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

          {client && (
            <section style={{ marginTop: 32 }}>
              <h2 className="cf-display" style={subtitulo}>
                Cliente
              </h2>
              <div className="cf-panel" style={{ padding: "14px 16px" }}>
                <div style={{ fontWeight: 600 }}>{client.name}</div>
                <div className="cf-num" style={{ fontSize: 14.5, color: "var(--cf-dim)", marginTop: 2 }}>
                  {client.phone || "Sin teléfono"}, {client.vehicleIds.length}{" "}
                  {client.vehicleIds.length === 1 ? "vehículo" : "vehículos"} en seguimiento
                </div>
              </div>
            </section>
          )}
        </div>

        <section>
          <h2 className="cf-display" style={subtitulo}>
            Historial
          </h2>
          {history.length === 0 ? (
            <p style={{ margin: 0, color: "var(--cf-dim)" }}>Este vehículo aún no tiene trabajos registrados.</p>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {history.map((r, i) => (
                <li
                  key={r.id}
                  style={{
                    position: "relative",
                    paddingLeft: 22,
                    paddingBottom: i === history.length - 1 ? 0 : 24,
                    borderLeft: `2px solid ${i === history.length - 1 ? "transparent" : "var(--cf-border)"}`,
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
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontWeight: 600 }}>{r.title}</span>
                    <span className="cf-num" style={{ fontSize: 14, color: "var(--cf-dim)", whiteSpace: "nowrap" }}>
                      {formatDate(r.date)}
                    </span>
                  </div>
                  <div className="cf-num" style={{ fontSize: 14, color: "var(--cf-dim)", margin: "2px 0 8px" }}>
                    {km(r.odometer)} km, {r.place === "taller" ? "en taller" : "particular"}
                    {r.parts.length > 0 && `. Piezas: ${r.parts.join(", ")}`}
                  </div>
                  <AuthorPill role={r.author.role} name={r.author.name} />

                  {/* Audit trail: cada modificación queda firmada, nada se sobrescribe. */}
                  <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {r.revisions.map((rev) => (
                      <li key={rev.id} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 13.5, flexWrap: "wrap" }}>
                        <span className="cf-num" style={{ color: "var(--cf-dim)", whiteSpace: "nowrap" }}>
                          {formatTimestamp(rev.timestamp)}
                        </span>
                        <span>{rev.description}</span>
                        <span style={{ color: rev.author.role === "taller" ? "var(--cf-accent)" : "var(--cf-persona)", fontWeight: 500 }}>
                          {rev.author.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
