import { useNavigate } from "react-router-dom";
import { PiPlus, PiWrench } from "react-icons/pi";
import { Patente, ProgressBar, StatusBadge, tiposDeVehiculo } from "@cf/ui";
import type { UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { useSesion } from "../sesion";
import { km, loQueViene } from "../format";

/**
 * `next` es el recordatorio pendiente más urgente de este vehículo, o undefined si no
 * tiene ninguno. El estado sale de ahí: la lista viene ordenada por urgencia desde el
 * servidor, así que el peor es el primero y no hace falta recalcular nada.
 */
function VehicleCard({ v, next, onClick }: { v: Vehicle; next?: UpcomingService; onClick: () => void }) {
  const { label, Icono } = tiposDeVehiculo[v.kind];
  return (
    <button
      className="cf-panel cf-tap"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 18,
        width: "100%",
        textAlign: "left",
        font: "inherit",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, width: "100%" }}>
        <Patente valor={v.plate} alto={30} />
        <StatusBadge status={next?.status ?? "ok"} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 18 }}>{v.name}</div>
        <div className="cf-num" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--cf-dim)", marginTop: 2 }}>
          <Icono aria-hidden size={16} />
          {label}, {km(v.odometer)} km
        </div>
      </div>
      {next && (
        <div style={{ width: "100%" }}>
          <div className="cf-num" style={{ fontSize: 14, marginBottom: 6 }}>
            {loQueViene(next)}
          </div>
          <ProgressBar value={next.progress} status={next.status} />
        </div>
      )}
    </button>
  );
}

export function Garaje() {
  const navigate = useNavigate();
  const { sesion } = useSesion();

  // Dos peticiones y no una por vehículo: /vehiculos ya viene filtrado por dueño —el
  // servidor lo saca del token— y /vehiculos/recordatorios trae lo pendiente de todos
  // juntos. Un garaje con diez autos sigue siendo dos llamadas.
  const flota = useApi<Vehicle[]>("/vehiculos");
  const pendientes = useApi<UpcomingService[]>("/vehiculos/recordatorios");

  if (flota.cargando || pendientes.cargando) return <Cargando que="tu garaje" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (pendientes.error) return <ErrorApi mensaje={pendientes.error} onReintentar={pendientes.recargar} />;

  const mine = flota.datos ?? [];
  const conPendiente = new Set((pendientes.datos ?? []).map((u) => u.vehicleId)).size;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 15, color: "var(--cf-dim)" }}>Hola, {sesion?.nombre.split(" ")[0]}</div>
          <h1 className="cf-display" style={{ fontSize: 40, margin: "2px 0 0" }}>
            Mis vehículos
          </h1>
          {mine.length > 0 && (
            <div className="cf-num" style={{ fontSize: 15, color: "var(--cf-dim)", marginTop: 6 }}>
              {mine.length} {mine.length === 1 ? "vehículo" : "vehículos"}
              {conPendiente > 0 && `, ${conPendiente} con algo pendiente`}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {mine.length > 0 && (
            <button className="cf-btn-quieto" onClick={() => navigate("/registrar")}>
              <PiWrench aria-hidden />
              Registrar mantención
            </button>
          )}
          <button className="cf-btn" onClick={() => navigate("/nuevo-vehiculo")}>
            <PiPlus aria-hidden />
            Agregar vehículo
          </button>
        </div>
      </div>

      {mine.length === 0 ? (
        <div className="cf-panel" style={{ padding: "32px 24px", maxWidth: 560 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Tu garaje está vacío</div>
          <p style={{ margin: "6px 0 18px", color: "var(--cf-dim)" }}>
            Agrega tu primer vehículo y Car Follow empieza a llevar la cuenta de sus mantenciones.
          </p>
          <button className="cf-btn" onClick={() => navigate("/nuevo-vehiculo")}>
            <PiPlus aria-hidden />
            Agregar vehículo
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {mine.map((v) => (
            <VehicleCard
              key={v.id}
              v={v}
              next={pendientes.datos?.find((u) => u.vehicleId === v.id)}
              onClick={() => navigate(`/vehiculo/${v.id}`)}
            />
          ))}
        </div>
      )}
    </>
  );
}
