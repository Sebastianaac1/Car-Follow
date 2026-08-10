import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthorPill } from "@cf/ui";
import { vehicleById, vehicles } from "@cf/mock-data";
import { useData } from "../store";
import { formatDate, km } from "../format";

const label: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 6, fontWeight: 500 };
const input: React.CSSProperties = { borderRadius: 10, padding: "10px 12px", fontSize: 13, width: "100%" };

export function Trabajos() {
  const { records, addJob } = useData();
  // La ficha del vehículo entra acá con ?vehiculo=<id> para no obligar a re-elegirlo.
  const [params] = useSearchParams();
  const desdeFicha = params.get("vehiculo");
  const [vehicleId, setVehicleId] = useState(
    vehicles.some((v) => v.id === desdeFicha) ? desdeFicha! : vehicles[0].id,
  );
  const [title, setTitle] = useState("Cambio de aceite + filtro");
  const [date, setDate] = useState("2026-07-23");
  const [odometer, setOdometer] = useState("84.500");
  const [partsText, setPartsText] = useState("Aceite 5W-30, Filtro aceite");

  const save = () => {
    addJob({
      vehicleId,
      title,
      date,
      odometer: Number(odometer.replace(/\./g, "")) || 0,
      parts: partsText.split(",").map((p) => p.trim()).filter(Boolean),
    });
  };

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Trabajos
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        Registra un trabajo — queda firmado por el taller en el historial del vehículo.
      </div>

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
        <div style={{ flex: 1, border: "1px solid var(--cf-border)", borderRadius: 16, background: "var(--cf-surface)", padding: 20 }}>
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Registrar trabajo
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={label}>Vehículo</div>
              <select className="cf-input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} style={input}>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.ownerName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={label}>Trabajo / servicio</div>
              <input className="cf-input" value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={label}>Fecha</div>
                <input className="cf-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={label}>Kilometraje</div>
                <input className="cf-input cf-mono" value={odometer} onChange={(e) => setOdometer(e.target.value)} style={input} />
              </div>
            </div>
            <div>
              <div style={label}>Piezas (separadas por coma)</div>
              <input className="cf-input" value={partsText} onChange={(e) => setPartsText(e.target.value)} style={input} />
            </div>
            <button className="cf-btn" onClick={save} style={{ height: 44, borderRadius: 12, fontSize: 14 }}>
              Guardar trabajo
            </button>
          </div>
        </div>

        <div style={{ flex: 1.1 }}>
          <div className="cf-mono" style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--cf-dim)", marginBottom: 10 }}>
            Trabajos recientes
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {records.map((r) => {
              const v = vehicleById(r.vehicleId);
              return (
                <div key={r.id} style={{ border: "1px solid var(--cf-border)", borderRadius: 14, background: "var(--cf-surface)", padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</span>
                    <span className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)" }}>
                      {v?.name}
                    </span>
                  </div>
                  <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", marginBottom: 8 }}>
                    {formatDate(r.date)} · {km(r.odometer)} km · {r.parts.join(", ")}
                  </div>
                  <AuthorPill role={r.author.role} name={r.author.name} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
