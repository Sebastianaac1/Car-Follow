import { useNavigate } from "react-router-dom";
import { ProgressBar, StatusBadge } from "@cf/ui";
import type { UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { useSesion } from "../sesion";
import { km } from "../format";

/** Etiqueta y silueta de fondo por tipo de vehículo (viewBox 24). */
const kindMeta: Record<Vehicle["kind"], { label: string; icon: string }> = {
  auto: {
    label: "Auto",
    icon: "M5 17h14M4 17v-4l2-5h12l2 5v4M7 17v2M17 17v2M7.5 13h1M15.5 13h1",
  },
  moto: {
    label: "Moto",
    icon: "M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 16h5l3-5h3M11 11l4 5M13 7.5h3",
  },
  camion: {
    label: "Camión",
    icon: "M2 6h13v10H9M2 6v10h1M15 9h3.5l2.5 3.5V16h-2M6.5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18.5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  },
  maquinaria: {
    label: "Maquinaria",
    icon: "M2 18h13v-3H2zM4 15v-3h6v3M10 12l4-5h2M16 7l3 2.5-2 3.5-3-1M4.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M12.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3",
  },
};

/**
 * `next` es el recordatorio pendiente más urgente de este vehículo, o undefined si no
 * tiene ninguno. El estado sale de ahí: la lista viene ordenada por urgencia desde el
 * servidor, así que el peor es el primero y no hace falta recalcular nada.
 */
function VehicleCard({ v, next, onClick }: { v: Vehicle; next?: UpcomingService; onClick: () => void }) {
  const status = next?.status ?? "ok";
  return (
    <div
      className="cf-card-tap"
      onClick={onClick}
      style={{
        border: "1px solid var(--cf-border)",
        borderRadius: 18,
        background: "var(--cf-surface)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 96,
          display: "flex",
          alignItems: "flex-end",
          padding: 10,
          background: "linear-gradient(135deg, var(--cf-surface-2), var(--cf-surface))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--cf-dim)"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", right: -14, top: -6, width: 116, height: 116, opacity: 0.16 }}
          aria-hidden
        >
          <path d={kindMeta[v.kind].icon} />
        </svg>
        <span
          className="cf-mono"
          style={{ position: "absolute", top: 11, left: 12, fontSize: 10, letterSpacing: 0.4, color: "var(--cf-dim)" }}
        >
          {kindMeta[v.kind].label}
        </span>
        <StatusBadge status={status} />
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</span>
          <span className="cf-mono" style={{ fontSize: 12, color: "var(--cf-dim)" }}>
            {v.plate}
          </span>
        </div>
        <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", margin: "8px 0 6px" }}>
          {km(v.odometer)} km{next && ` · ${next.part.toLowerCase()} en ${next.remainingLabel}`}
        </div>
        {next && <ProgressBar value={next.progress} status={next.status} />}
      </div>
    </div>
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

  return (
    <div style={{ padding: "8px 20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--cf-dim)" }}>Hola, {sesion?.nombre.split(" ")[0]}</div>
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 22 }}>
            Mis vehículos
          </div>
        </div>
        <button
          className="cf-btn"
          onClick={() => navigate("/registrar")}
          aria-label="Registrar mantención"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          +
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mine.map((v) => (
          <VehicleCard
            key={v.id}
            v={v}
            next={pendientes.datos?.find((u) => u.vehicleId === v.id)}
            onClick={() => navigate(`/vehiculo/${v.id}`)}
          />
        ))}
        {mine.length === 0 && (
          <div
            style={{
              border: "1px dashed var(--cf-border)",
              borderRadius: 18,
              padding: "28px 20px",
              textAlign: "center",
              fontSize: 13,
              color: "var(--cf-dim)",
              lineHeight: 1.55,
            }}
          >
            Tu garaje está vacío.
            <br />
            Agrega tu primer vehículo con el botón <strong style={{ color: "var(--cf-accent)" }}>+</strong>.
          </div>
        )}
      </div>
    </div>
  );
}
