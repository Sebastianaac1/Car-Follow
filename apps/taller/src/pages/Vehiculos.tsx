import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@cf/ui";
import { nextUpcoming, vehicles, vehicleStatus } from "@cf/mock-data";
import { useData } from "../store";
import { km } from "../format";

const cols = "1.4fr 1fr 1fr 1.1fr 0.8fr";
const kindLabel: Record<string, string> = { auto: "Auto", moto: "Moto", camion: "Camión", maquinaria: "Maquinaria" };

export function Vehiculos() {
  const navigate = useNavigate();
  const { records } = useData();

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Vehículos
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        Todos los vehículos en seguimiento del taller — abre uno para ver su ficha completa.
      </div>

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
        {vehicles.map((v) => {
          const next = nextUpcoming(v.id, records);
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
                {next ? `${next.part} · ${next.remainingLabel}` : "sin registros"}
              </span>
              <StatusBadge status={vehicleStatus(v.id, records)} />
            </div>
          );
        })}
      </div>
    </>
  );
}
