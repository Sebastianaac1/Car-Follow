import { useNavigate } from "react-router-dom";
import type { MaintenanceRecord, UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { formatDate } from "../format";

export function Alertas() {
  const navigate = useNavigate();

  // El servidor ya filtra lo que no está ok y lo ordena por urgencia: es la misma cuenta
  // que ven los recordatorios del taller, hecha una sola vez y en un solo lugar.
  const pendientes = useApi<UpcomingService[]>("/vehiculos/recordatorios");
  // Los nombres de los vehículos no vienen en el recordatorio, así que la flota se pide
  // aparte para poder decir "Toyota Hilux" en vez de un id.
  const flota = useApi<Vehicle[]>("/vehiculos");
  const historial = useApi<MaintenanceRecord[]>("/vehiculos/mantenciones");

  if (pendientes.cargando || flota.cargando || historial.cargando) return <Cargando que="tus alertas" />;
  if (pendientes.error) return <ErrorApi mensaje={pendientes.error} onReintentar={pendientes.recargar} />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (historial.error) return <ErrorApi mensaje={historial.error} onReintentar={historial.recargar} />;

  const nombreDe = (id: string) => flota.datos?.find((v) => v.id === id)?.name ?? "tu vehículo";

  // Avisos de lo que el taller escribió en tu historial, lo más reciente primero. Viene
  // ordenado por fecha desde el servidor.
  const delTaller = (historial.datos ?? []).filter((r) => r.author.role === "taller").slice(0, 2);

  const vacio = (pendientes.datos ?? []).length === 0 && delTaller.length === 0;

  return (
    <div style={{ padding: "14px 20px" }}>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
        Alertas
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(pendientes.datos ?? []).map((u) => {
          const vencido = u.status === "vencido";
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
                  {nombreDe(u.vehicleId)}
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
              {r.author.name} añadió “{r.title.toLowerCase()}” a tu {nombreDe(r.vehicleId)}. Revísalo y confírmalo.
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
