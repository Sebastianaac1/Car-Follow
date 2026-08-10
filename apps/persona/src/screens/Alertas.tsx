import { useNavigate } from "react-router-dom";
import { upcomingFor, vehicleById, vehicles } from "@cf/mock-data";
import { useData } from "../store";
import { useSesion } from "../sesion";
import { formatDate } from "../format";

export function Alertas() {
  const navigate = useNavigate();
  const { records } = useData();
  const { sesion } = useSesion();
  const mine = vehicles.filter((v) => v.ownerId === sesion?.ownerId);

  // Las alertas salen de las mismas reglas que los recordatorios del taller.
  const pendientes = mine
    .flatMap((v) => upcomingFor(v.id, records))
    .filter((u) => u.status !== "ok")
    .sort((a, b) => b.progress - a.progress);

  // Avisos de lo que el taller escribió en tu historial, lo más reciente primero.
  const delTaller = records
    .filter((r) => r.author.role === "taller" && mine.some((v) => v.id === r.vehicleId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);

  const vacio = pendientes.length === 0 && delTaller.length === 0;

  return (
    <div style={{ padding: "14px 20px" }}>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
        Alertas
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pendientes.map((u) => {
          const vencido = u.status === "vencido";
          const vehicle = vehicleById(u.vehicleId)!;
          return (
            <div
              key={u.id}
              style={{
                border: `1px solid ${vencido ? "var(--cf-danger)" : "var(--cf-border)"}`,
                borderRadius: 16,
                background: vencido ? "var(--cf-danger-soft)" : "var(--cf-surface)",
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span
                  style={{ fontWeight: 600, fontSize: 14, color: vencido ? "var(--cf-danger)" : "var(--cf-warn)" }}
                >
                  {u.part} {vencido ? "vencido" : "pronto"}
                </span>
                <span className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)" }}>
                  {vehicle.name}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--cf-text)", lineHeight: 1.45 }}>
                {vencido ? `Superaste el intervalo: ${u.remainingLabel}.` : `Faltan ${u.remainingLabel}.`} La regla es{" "}
                {u.ruleLabel}.
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button
                  className="cf-tap"
                  onClick={() => navigate("/registrar")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    border: "none",
                    background: vencido ? "var(--cf-danger)" : "var(--cf-accent)",
                    color: "var(--cf-on-accent)",
                  }}
                >
                  Ya lo hice
                </button>
                <button
                  className="cf-tap"
                  onClick={() => navigate(`/vehiculo/${u.vehicleId}`)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontFamily: "inherit",
                    border: "1px solid var(--cf-border)",
                    background: "transparent",
                    color: "var(--cf-text)",
                  }}
                >
                  Ver vehículo
                </button>
              </div>
            </div>
          );
        })}

        {delTaller.map((r) => (
          <div
            key={r.id}
            style={{ border: "1px solid var(--cf-border)", borderRadius: 16, background: "var(--cf-surface)", padding: 14 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Registro del taller</span>
              <span className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)" }}>
                {formatDate(r.date)}
              </span>
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
              {r.author.name} añadió “{r.title.toLowerCase()}” a tu {vehicleById(r.vehicleId)?.name}. Revísalo y
              confírmalo.
            </div>
          </div>
        ))}

        {vacio && (
          <div style={{ fontSize: 12.5, color: "var(--cf-dim)", lineHeight: 1.5 }}>
            No tienes alertas: todas tus piezas están dentro de su intervalo.
          </div>
        )}
      </div>
    </div>
  );
}
