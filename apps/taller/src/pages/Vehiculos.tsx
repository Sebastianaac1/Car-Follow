import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@cf/ui";
import type { UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { km } from "../format";

const cols = "1.4fr 1fr 1fr 1.1fr 0.8fr";
const kindLabel: Record<Vehicle["kind"], string> = {
  auto: "Auto",
  moto: "Moto",
  camion: "Camión",
  maquinaria: "Maquinaria",
};

export function Vehiculos() {
  const navigate = useNavigate();

  // Las dos rutas ya vienen filtradas por el taller de la sesión: la cadena
  // Account → Workshop → WorkshopClient → Client → Vehicle la resuelve el servidor.
  const flota = useApi<Vehicle[]>("/taller/vehiculos");
  const pendientes = useApi<UpcomingService[]>("/taller/recordatorios");

  if (flota.cargando || pendientes.cargando) return <Cargando que="los vehículos" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (pendientes.error) return <ErrorApi mensaje={pendientes.error} onReintentar={pendientes.recargar} />;

  const vehiculos = flota.datos ?? [];
  const recordatorios = pendientes.datos ?? [];

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Vehículos
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        Todos los vehículos en seguimiento del taller — abre uno para ver su ficha completa.
      </div>

      {vehiculos.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--cf-border)",
            borderRadius: 14,
            padding: "30px 20px",
            textAlign: "center",
            fontSize: 13,
            color: "var(--cf-dim)",
            lineHeight: 1.6,
          }}
        >
          Todavía no hay vehículos en seguimiento.
          <br />
          Los vehículos se cargan desde la ficha de su cliente:{" "}
          <button
            onClick={() => navigate("/clientes")}
            className="cf-tap"
            style={{
              border: "none",
              background: "none",
              padding: 0,
              font: "inherit",
              color: "var(--cf-accent)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ir a Clientes →
          </button>
        </div>
      ) : (
        <>
          <div
            className="cf-mono"
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              padding: "0 14px 10px",
              fontSize: 10.5,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: "var(--cf-dim)",
            }}
          >
            <span>Vehículo</span>
            <span>Tipo</span>
            <span>Cliente</span>
            <span>Próximo</span>
            <span>Estado</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vehiculos.map((v) => {
              // La lista viene ordenada por urgencia desde el servidor: el primero que
              // coincide con este vehículo ya es el peor pendiente que tiene.
              const next = recordatorios.find((u) => u.vehicleId === v.id);
              return (
                <div
                  key={v.id}
                  className="cf-tap"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/vehiculos/${v.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/vehiculos/${v.id}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: cols,
                    alignItems: "center",
                    padding: "12px 14px",
                    border: "1px solid var(--cf-border)",
                    borderRadius: 12,
                    background: "var(--cf-surface)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v.name}</div>
                    <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)" }}>
                      {v.plate} · {km(v.odometer)} km
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5 }}>{kindLabel[v.kind]}</span>
                  <span style={{ fontSize: 12.5 }}>{v.ownerName}</span>
                  <span className="cf-mono" style={{ fontSize: 11.5 }}>
                    {next ? `${next.part} · ${next.remainingLabel}` : "sin pendientes"}
                  </span>
                  <StatusBadge status={next?.status ?? "ok"} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
