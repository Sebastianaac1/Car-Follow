import { Link } from "react-router-dom";
import { Patente, StatusBadge, tiposDeVehiculo } from "@cf/ui";
import type { UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { km, loQueViene } from "../format";

// Anchos fijos en los extremos: cada fila es su propia grilla, y con "auto" el encabezado
// y las filas medían distinto y las columnas quedaban corridas.
const cols = "120px minmax(160px, 1.4fr) minmax(0, 1fr) minmax(0, 1.3fr) 112px";

export function Vehiculos() {
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
      <h1 className="cf-display" style={{ fontSize: 40, margin: 0 }}>
        Vehículos
      </h1>
      <p style={{ color: "var(--cf-dim)", margin: "6px 0 24px" }}>
        Todos los vehículos en seguimiento del taller. Abre uno para ver su ficha completa.
      </p>

      {vehiculos.length === 0 ? (
        <div className="cf-panel" style={{ padding: "24px 20px", maxWidth: 560 }}>
          <div style={{ fontWeight: 600 }}>Todavía no hay vehículos en seguimiento</div>
          <p style={{ margin: "4px 0 0", color: "var(--cf-dim)" }}>
            Los vehículos se cargan desde la ficha de su cliente, en <Link to="/clientes">Clientes</Link>.
          </p>
        </div>
      ) : (
        <div className="cf-panel" style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 760 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                gap: 16,
                padding: "12px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--cf-dim)",
                borderBottom: "1px solid var(--cf-border)",
              }}
            >
              <span>Patente</span>
              <span>Vehículo</span>
              <span>Cliente</span>
              <span>Lo que viene</span>
              <span>Estado</span>
            </div>
            <div className="cf-lista">
              {vehiculos.map((v) => {
                // La lista viene ordenada por urgencia desde el servidor: el primero que
                // coincide con este vehículo ya es el peor pendiente que tiene.
                const next = recordatorios.find((u) => u.vehicleId === v.id);
                const { label, Icono } = tiposDeVehiculo[v.kind];
                return (
                  <Link
                    key={v.id}
                    to={`/vehiculos/${v.id}`}
                    className="cf-tap"
                    style={{
                      display: "grid",
                      gridTemplateColumns: cols,
                      gap: 16,
                      alignItems: "center",
                      padding: "12px 16px",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <span>
                      <Patente valor={v.plate} alto={26} />
                    </span>
                    <span>
                      <span style={{ display: "block", fontWeight: 600 }}>{v.name}</span>
                      <span className="cf-num" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, color: "var(--cf-dim)" }}>
                        <Icono aria-hidden />
                        {label}, {km(v.odometer)} km
                      </span>
                    </span>
                    <span style={{ fontSize: 14.5 }}>{v.ownerName}</span>
                    <span className="cf-num" style={{ fontSize: 14 }}>
                      {next ? loQueViene(next) : "Sin pendientes"}
                    </span>
                    <StatusBadge status={next?.status ?? "ok"} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
