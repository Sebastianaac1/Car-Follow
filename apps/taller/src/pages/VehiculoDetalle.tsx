import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthorPill, ProgressBar, StatusBadge } from "@cf/ui";
import { clientById, upcomingFor, vehicleById, vehicleStatus } from "@cf/mock-data";
import { useData } from "../store";
import { formatDate, km } from "../format";

const kindLabel: Record<string, string> = { auto: "Auto", moto: "Moto", camion: "Camión", maquinaria: "Maquinaria" };

const microLabel: React.CSSProperties = {
  fontSize: 10.5,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "var(--cf-dim)",
  marginBottom: 10,
  fontFamily: "'IBM Plex Mono', monospace",
};

const card: React.CSSProperties = {
  border: "1px solid var(--cf-border)",
  borderRadius: 16,
  background: "var(--cf-surface)",
  padding: 18,
};

export function VehiculoDetalle() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { records, recordsByVehicle } = useData();

  const vehicle = vehicleById(id);
  if (!vehicle) {
    return (
      <>
        <div className="cf-display" style={{ fontWeight: 600, fontSize: 22, marginBottom: 6 }}>
          Vehículo no encontrado
        </div>
        <div style={{ fontSize: 13, color: "var(--cf-dim)", marginBottom: 18 }}>
          No hay ningún vehículo con el id <span className="cf-mono">{id}</span>.
        </div>
        <Link to="/vehiculos">← Volver a Vehículos</Link>
      </>
    );
  }

  const client = clientById(vehicle.ownerId);
  const upcoming = upcomingFor(vehicle.id, records);
  const history = recordsByVehicle(vehicle.id).slice().sort((a, b) => b.date.localeCompare(a.date));
  const phoneDigits = client?.phone.replace(/\D/g, "") ?? "";

  return (
    <>
      <Link to="/vehiculos" style={{ fontSize: 12.5, color: "var(--cf-dim)" }}>
        ← Vehículos
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, margin: "10px 0 22px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="cf-display" style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-.3px" }}>
              {vehicle.name}
            </span>
            <StatusBadge status={vehicleStatus(vehicle.id, records)} />
          </div>
          <div className="cf-mono" style={{ fontSize: 12, color: "var(--cf-dim)", marginTop: 5 }}>
            {vehicle.plate} · {kindLabel[vehicle.kind]} · {km(vehicle.odometer)} km · {vehicle.ownerName}
          </div>
        </div>

        <div style={{ display: "flex", gap: 9, flexShrink: 0 }}>
          {client && (
            <>
              <a className="cf-tap" href={`tel:${phoneDigits}`} style={accion}>
                Llamar
              </a>
              <a
                className="cf-tap"
                href={`https://wa.me/${phoneDigits}`}
                target="_blank"
                rel="noreferrer"
                style={accion}
              >
                WhatsApp
              </a>
            </>
          )}
          <button
            className="cf-btn"
            onClick={() => navigate(`/trabajos?vehiculo=${vehicle.id}`)}
            style={{ padding: "9px 16px", borderRadius: 10, fontSize: 13, whiteSpace: "nowrap" }}
          >
            + Registrar trabajo
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div style={card}>
            <div style={microLabel}>Próximas mantenciones</div>
            {upcoming.length === 0 && (
              <div style={{ fontSize: 12.5, color: "var(--cf-dim)" }}>
                Sin trabajos registrados: no hay desde dónde contar ningún intervalo.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {upcoming.map((u) => (
                <div key={u.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{u.part}</span>
                    <span className="cf-mono" style={{ fontSize: 11.5, color: colorEstado(u.status) }}>
                      {u.remainingLabel}
                    </span>
                  </div>
                  <ProgressBar value={Math.min(1, u.progress)} status={u.status} height={6} />
                  <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)", marginTop: 6 }}>
                    {u.ruleLabel}
                  </div>
                  <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)", marginTop: 2 }}>
                    desde {formatDate(u.since.date)} · {km(u.since.odometer)} km
                  </div>
                </div>
              ))}
            </div>
          </div>

          {client && (
            <div style={{ ...card, marginTop: 16 }}>
              <div style={microLabel}>Cliente</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{client.name}</div>
              <div className="cf-mono" style={{ fontSize: 12, color: "var(--cf-dim)", marginTop: 4 }}>
                {client.phone} · {client.vehicleIds.length} vehículo
                {client.vehicleIds.length === 1 ? "" : "s"} en seguimiento
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <div style={card}>
            <div style={microLabel}>Historial · {history.length} trabajos</div>
            {history.length === 0 && (
              <div style={{ fontSize: 12.5, color: "var(--cf-dim)" }}>Este vehículo aún no tiene trabajos registrados.</div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {history.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    borderLeft: "2px solid var(--cf-border)",
                    marginLeft: 5,
                    paddingLeft: 16,
                    paddingBottom: i === history.length - 1 ? 0 : 18,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: -6,
                      top: 3,
                      width: 10,
                      height: 10,
                      borderRadius: 99,
                      background: r.author.role === "taller" ? "var(--cf-accent)" : "var(--cf-persona)",
                      border: "2px solid var(--cf-surface)",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{r.title}</span>
                    <span className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", whiteSpace: "nowrap" }}>
                      {formatDate(r.date)}
                    </span>
                  </div>
                  <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", margin: "3px 0 7px" }}>
                    {km(r.odometer)} km · {r.place === "taller" ? "en taller" : "particular"} · {r.parts.join(", ")}
                  </div>
                  <AuthorPill role={r.author.role} name={r.author.name} />

                  {/* Audit trail: cada modificación queda firmada, nada se sobrescribe. */}
                  <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 6 }}>
                    {r.revisions.map((rev) => (
                      <div key={rev.id} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 11.5 }}>
                        <span className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)", whiteSpace: "nowrap" }}>
                          {rev.timestamp}
                        </span>
                        <span style={{ color: "var(--cf-dim)" }}>{rev.description}</span>
                        <span className="cf-mono" style={{ fontSize: 10, color: colorAutor(rev.author.role) }}>
                          {rev.author.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const accion: React.CSSProperties = {
  padding: "9px 15px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  border: "1px solid var(--cf-border)",
  background: "var(--cf-surface)",
  color: "var(--cf-text)",
  whiteSpace: "nowrap",
};

function colorEstado(status: "ok" | "pronto" | "vencido"): string {
  if (status === "vencido") return "var(--cf-danger)";
  if (status === "pronto") return "var(--cf-warn)";
  return "var(--cf-ok)";
}

function colorAutor(role: "persona" | "taller"): string {
  return role === "taller" ? "var(--cf-accent)" : "var(--cf-persona)";
}
