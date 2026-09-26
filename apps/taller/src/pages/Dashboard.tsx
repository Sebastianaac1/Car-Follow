import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PiMagnifyingGlass, PiPlus } from "react-icons/pi";
import { Patente, StatusBadge } from "@cf/ui";
import type { MaintenanceRecord, UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { AuditPanel } from "../components/AuditPanel";
import { loQueViene } from "../format";

// Pasa las 200 líneas a propósito: el resumen, la tabla y la ficha lateral son una
// sola pantalla maestro-detalle que comparte las mismas tres listas.

// Anchos fijos en los extremos: cada fila es su propia grilla, y con "auto" el encabezado
// y las filas medían distinto y las columnas quedaban corridas.
const gridCols = "minmax(180px, 1.5fr) minmax(0, 1fr) minmax(0, 1.3fr) 112px";

/** Prefijo AAAA-MM del mes corriente, en hora local: es el mes que cuenta quien mira. */
function mesActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Tres peticiones para todo el panel, no una por vehículo: las tres rutas ya vienen
  // filtradas por el taller de la sesión. Una cartera de cien autos sigue siendo tres
  // llamadas.
  const flota = useApi<Vehicle[]>("/taller/vehiculos");
  const pendientes = useApi<UpcomingService[]>("/taller/recordatorios");
  const trabajos = useApi<MaintenanceRecord[]>("/taller/trabajos");

  if (flota.cargando || pendientes.cargando || trabajos.cargando) return <Cargando que="la cartera del taller" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (pendientes.error) return <ErrorApi mensaje={pendientes.error} onReintentar={pendientes.recargar} />;
  if (trabajos.error) return <ErrorApi mensaje={trabajos.error} onReintentar={trabajos.recargar} />;

  const vehiculos = flota.datos ?? [];
  const recordatorios = pendientes.datos ?? [];
  const historial = trabajos.datos ?? [];

  // Los números salen de estas mismas tres listas: no hay ningún contador guardado que
  // pueda quedar desincronizado de los datos que se ven abajo.
  const vencidos = recordatorios.filter((u) => u.status === "vencido").length;
  const proximos = recordatorios.filter((u) => u.status === "pronto").length;
  const conPendiente = new Set(recordatorios.map((u) => u.vehicleId)).size;
  const mes = mesActual();
  const trabajosDelMes = historial.filter((r) => r.date.startsWith(mes)).length;

  const q = query.trim().toLowerCase();
  const rows = vehiculos
    .filter((v) => !q || `${v.name} ${v.plate} ${v.ownerName}`.toLowerCase().includes(q))
    // El servidor manda los recordatorios ordenados por urgencia, así que el primero que
    // coincide con este vehículo ya es el peor: no hay que recalcular nada.
    .map((v) => ({ vehicle: v, next: recordatorios.find((u) => u.vehicleId === v.id) }))
    .sort((a, b) => (b.next?.progress ?? 0) - (a.next?.progress ?? 0));

  // Si el filtro deja fuera al vehículo seleccionado, la ficha pasa a la primera
  // fila visible en vez de quedar mostrando algo que ya no está en la tabla.
  const enFicha = rows.some((r) => r.vehicle.id === selected) ? selected : rows[0]?.vehicle.id ?? null;
  const vehiculoEnFicha = vehiculos.find((v) => v.id === enFicha);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h1 className="cf-display" style={{ fontSize: 40, margin: 0 }}>
            Vehículos en seguimiento
          </h1>
          <div className="cf-num" style={{ color: "var(--cf-dim)", marginTop: 6 }}>
            {vehiculos.length} activos, {conPendiente} con mantención pendiente
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <PiMagnifyingGlass
              aria-hidden
              size={18}
              style={{ position: "absolute", left: 11, top: 12, color: "var(--cf-dim)", pointerEvents: "none" }}
            />
            <input
              className="cf-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Patente, vehículo o cliente"
              aria-label="Buscar por patente, vehículo o cliente"
              style={{ width: 250, paddingLeft: 36 }}
            />
          </div>
          <button className="cf-btn" onClick={() => navigate("/trabajos")} style={{ height: 42 }}>
            <PiPlus aria-hidden />
            Registrar trabajo
          </button>
        </div>
      </div>

      {/* Tres lecturas en una sola franja, no tres tarjetas con un número gigante: son
          partes de la misma pregunta ("¿cómo está la cartera hoy?"). */}
      <div className="cf-panel" style={{ display: "flex", flexWrap: "wrap", marginBottom: 28 }}>
        {[
          { valor: vencidos, texto: vencidos === 1 ? "mantención vencida" : "mantenciones vencidas", color: "var(--cf-danger)" },
          { valor: proximos, texto: "por vencer", color: "var(--cf-warn)" },
          { valor: trabajosDelMes, texto: trabajosDelMes === 1 ? "trabajo este mes" : "trabajos este mes", color: "var(--cf-ok)" },
        ].map(({ valor, texto, color }) => (
          <div key={texto} style={{ flex: "1 1 200px", display: "flex", alignItems: "baseline", gap: 10, padding: "16px 20px" }}>
            <span className="cf-display cf-num" style={{ fontSize: 36, fontWeight: 700, color }}>
              {valor}
            </span>
            <span style={{ fontSize: 15 }}>{texto}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="cf-panel" style={{ flex: "1.6 1 520px", minWidth: 0, overflowX: "auto" }}>
          {/* En angosto la tabla se desplaza de lado en vez de apretar las columnas. */}
          <div style={{ minWidth: 620 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: 16,
                padding: "12px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--cf-dim)",
                borderBottom: "1px solid var(--cf-border)",
              }}
            >
              <span>Vehículo</span>
              <span>Cliente</span>
              <span>Lo que viene</span>
              <span>Estado</span>
            </div>
            <div className="cf-lista">
              {rows.map(({ vehicle, next }) => {
                const active = enFicha === vehicle.id;
                return (
                  <button
                    key={vehicle.id}
                    className="cf-tap"
                    onClick={() => setSelected(vehicle.id)}
                    aria-pressed={active}
                    style={{
                      display: "grid",
                      gridTemplateColumns: gridCols,
                      gap: 16,
                      alignItems: "center",
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      boxShadow: active ? "inset 3px 0 0 var(--cf-accent)" : "none",
                      background: active ? "var(--cf-accent-soft)" : "transparent",
                      font: "inherit",
                      color: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, minWidth: 0 }}>
                      <Patente valor={vehicle.plate} alto={24} />
                      <span style={{ fontWeight: 600, fontSize: 14.5 }}>{vehicle.name}</span>
                    </span>
                    <span style={{ fontSize: 14.5 }}>{vehicle.ownerName}</span>
                    <span className="cf-num" style={{ fontSize: 14 }}>
                      {next ? loQueViene(next) : "Sin pendientes"}
                    </span>
                    <StatusBadge status={next?.status ?? "ok"} />
                  </button>
                );
              })}
            </div>
            {rows.length === 0 && (
              <div style={{ padding: "28px 16px", color: "var(--cf-dim)" }}>
                {vehiculos.length === 0 ? (
                  <>
                    Todavía no hay vehículos en seguimiento. Agrega un cliente en{" "}
                    <Link to="/clientes">Clientes</Link>{" "}
                    y después su vehículo.
                  </>
                ) : (
                  <>Ningún vehículo coincide con “{query}”.</>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: "1 1 320px", minWidth: 0, position: "sticky", top: 24 }}>
          {/* La ficha no pide nada más: el último trabajo y el próximo servicio ya están
              en las listas de arriba, así que seleccionar una fila no dispara una
              petición nueva. */}
          <AuditPanel
            vehicle={vehiculoEnFicha}
            ultimo={historial.find((r) => r.vehicleId === enFicha)}
            proximo={recordatorios.find((u) => u.vehicleId === enFicha)}
          />
        </div>
      </div>
    </>
  );
}
