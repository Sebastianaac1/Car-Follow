import { useNavigate } from "react-router-dom";
import { PiCheckCircle, PiClock, PiStamp, PiWarning } from "react-icons/pi";
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
  const lista = pendientes.datos ?? [];

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 className="cf-display" style={{ fontSize: 40, margin: "0 0 20px" }}>
        Alertas
      </h1>

      {lista.length === 0 && delTaller.length === 0 && (
        <div className="cf-panel" style={{ display: "flex", gap: 12, alignItems: "center", padding: 20 }}>
          <PiCheckCircle aria-hidden size={26} color="var(--cf-ok)" />
          No tienes alertas. Todas tus piezas están dentro de su intervalo.
        </div>
      )}

      {lista.length > 0 && (
        <div className="cf-panel cf-lista" style={{ marginBottom: 28 }}>
          {lista.map((u) => {
            const vencido = u.status === "vencido";
            const Icono = vencido ? PiWarning : PiClock;
            return (
              <div key={u.id} style={{ display: "flex", gap: 14, padding: "16px 18px" }}>
                <Icono aria-hidden size={24} color={vencido ? "var(--cf-danger)" : "var(--cf-warn)"} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, color: vencido ? "var(--cf-danger)" : "var(--cf-warn)" }}>
                      {u.part} {vencido ? "vencido" : "pronto"}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--cf-dim)" }}>{nombreDe(u.vehicleId)}</span>
                  </div>
                  <p className="cf-num" style={{ margin: "4px 0 12px", fontSize: 14.5 }}>
                    {vencido ? `Superaste el intervalo: ${u.remainingLabel}.` : `Faltan ${u.remainingLabel}.`} La regla es{" "}
                    {u.ruleLabel}.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="cf-btn" onClick={() => navigate("/registrar")} style={{ height: 36 }}>
                      Ya lo hice
                    </button>
                    <button className="cf-btn-quieto" onClick={() => navigate(`/vehiculo/${u.vehicleId}`)} style={{ height: 36 }}>
                      Ver vehículo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {delTaller.length > 0 && (
        <section>
          <h2 className="cf-display" style={{ fontSize: 24, margin: "0 0 12px" }}>
            Lo que registró el taller
          </h2>
          <div className="cf-panel cf-lista">
            {delTaller.map((r) => (
              <div key={r.id} style={{ display: "flex", gap: 14, padding: "16px 18px" }}>
                <PiStamp aria-hidden size={24} color="var(--cf-accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div className="cf-num" style={{ fontSize: 14, color: "var(--cf-dim)" }}>{formatDate(r.date)}</div>
                  <p style={{ margin: "2px 0 0", fontSize: 14.5 }}>
                    {r.author.name} añadió “{r.title.toLowerCase()}” a tu {nombreDe(r.vehicleId)}. Revísalo y confírmalo.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
