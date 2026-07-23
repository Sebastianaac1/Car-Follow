import { StatusBadge } from "@cf/ui";
import { vehicles, workshopRows } from "@cf/mock-data";
import { km } from "../format";

const cols = "1.4fr 1fr 1fr 1fr 0.8fr";
const kindLabel: Record<string, string> = { auto: "Auto", moto: "Moto", camion: "Camión", maquinaria: "Maquinaria" };

export function Vehiculos() {
  const nextById = Object.fromEntries(workshopRows.map((r) => [r.vehicleId, r.next]));

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Vehículos
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        Todos los vehículos en seguimiento del taller
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
        {vehicles.map((v) => (
          <div
            key={v.id}
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              alignItems: "center",
              padding: "12px 14px",
              border: "1px solid var(--cf-border)",
              borderRadius: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v.name}</div>
              <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)" }}>
                {km(v.odometer)} km
              </div>
            </div>
            <span style={{ fontSize: 12.5 }}>{kindLabel[v.kind]}</span>
            <span style={{ fontSize: 12.5 }}>{v.ownerName}</span>
            <span className="cf-mono" style={{ fontSize: 11.5 }}>
              {nextById[v.id] ?? "—"}
            </span>
            <StatusBadge status={v.status} />
          </div>
        ))}
      </div>
    </>
  );
}
