import { useNavigate } from "react-router-dom";
import { ProgressBar, StatusBadge } from "@cf/ui";
import { nextServiceLabel, vehicles } from "@cf/mock-data";
import type { Vehicle } from "@cf/types";

const photo =
  "repeating-linear-gradient(45deg,var(--cf-surface-2),var(--cf-surface-2) 9px,transparent 9px,transparent 18px)";

function VehicleCard({ v, onClick }: { v: Vehicle; onClick: () => void }) {
  const next = nextServiceLabel[v.id];
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid var(--cf-border)",
        borderRadius: 18,
        background: "var(--cf-surface)",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: 96,
          display: "flex",
          alignItems: "flex-end",
          padding: 10,
          background: photo,
          position: "relative",
        }}
      >
        <span className="cf-mono" style={{ position: "absolute", top: 10, left: 12, fontSize: 10, color: "var(--cf-dim)" }}>
          foto
        </span>
        <StatusBadge status={v.status} />
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</span>
          <span className="cf-mono" style={{ fontSize: 12, color: "var(--cf-dim)" }}>
            {v.plate}
          </span>
        </div>
        <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", margin: "8px 0 6px" }}>
          {next?.text ?? `${v.odometer.toLocaleString("es-CL")} km`}
        </div>
        {next && <ProgressBar value={next.progress} status={v.status} />}
      </div>
    </div>
  );
}

export function Garaje() {
  const navigate = useNavigate();
  const mine = vehicles.filter((v) => v.ownerId === "martin");

  return (
    <div style={{ padding: "8px 20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--cf-dim)" }}>Hola, Martín</div>
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 22 }}>
            Mis vehículos
          </div>
        </div>
        <div
          onClick={() => navigate("/registrar")}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "var(--cf-accent)",
            color: "var(--cf-on-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          +
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mine.map((v) => (
          <VehicleCard key={v.id} v={v} onClick={() => navigate(`/vehiculo/${v.id}`)} />
        ))}
      </div>
    </div>
  );
}
