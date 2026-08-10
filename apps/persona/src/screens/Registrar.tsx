import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { vehicles } from "@cf/mock-data";
import { useData } from "../store";
import { useSesion } from "../sesion";

const labelStyle: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 6, fontWeight: 500 };
const inputStyle: React.CSSProperties = {
  border: "1px solid var(--cf-border)",
  borderRadius: 11,
  padding: "11px 13px",
  background: "var(--cf-surface)",
  fontSize: 13.5,
  color: "var(--cf-text)",
  width: "100%",
  fontFamily: "'IBM Plex Mono', monospace",
};

function chip(on: boolean): React.CSSProperties {
  return {
    padding: "8px 13px",
    borderRadius: 10,
    border: `1px solid ${on ? "var(--cf-accent)" : "var(--cf-border)"}`,
    fontSize: 12.5,
    color: on ? "var(--cf-accent)" : "var(--cf-dim)",
    fontWeight: on ? 600 : 400,
    background: on ? "var(--cf-accent-soft)" : "var(--cf-surface)",
    cursor: "pointer",
  };
}

const services = ["Aceite motor", "Frenos", "Filtros", "+ otro"];

export function Registrar() {
  const navigate = useNavigate();
  const { addRecord } = useData();
  const { sesion } = useSesion();
  const mine = vehicles.filter((v) => v.ownerId === sesion?.ownerId);

  const [vehicleId, setVehicleId] = useState(mine[0]?.id ?? "");
  const [service, setService] = useState("Aceite motor");
  const [date, setDate] = useState("2026-07-06");
  const [odometer, setOdometer] = useState("84.320");
  const [place, setPlace] = useState<"taller" | "particular">("taller");
  const [parts, setParts] = useState<string[]>(["Aceite 5W-30 ×4L", "Filtro aceite"]);
  const [newPart, setNewPart] = useState("");
  const [scheduleNext, setScheduleNext] = useState(true);
  const [everyKm, setEveryKm] = useState("10.000");
  const [everyMonths, setEveryMonths] = useState("12");

  const removePart = (p: string) => setParts((prev) => prev.filter((x) => x !== p));
  const addPart = () => {
    const t = newPart.trim();
    if (t) {
      setParts((prev) => [...prev, t]);
      setNewPart("");
    }
  };

  const save = () => {
    addRecord({
      vehicleId,
      title: service === "+ otro" ? "Mantención" : service,
      date,
      odometer: Number(odometer.replace(/\./g, "")) || 0,
      place,
      parts,
      nextRule: scheduleNext
        ? {
            intervalKm: Number(everyKm.replace(/\./g, "")) || null,
            intervalMonths: Number(everyMonths) || null,
          }
        : undefined,
    });
    navigate(`/vehiculo/${vehicleId}`);
  };

  if (mine.length === 0) {
    return (
      <div style={{ padding: 20, fontSize: 13, color: "var(--cf-dim)", lineHeight: 1.5 }}>
        Necesitas al menos un vehículo para registrar una mantención.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 20px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span onClick={() => navigate("/")} style={{ fontSize: 18, cursor: "pointer" }}>
            ✕
          </span>
          <span className="cf-display" style={{ fontWeight: 600, fontSize: 18 }}>
            Registrar mantención
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={labelStyle}>Vehículo</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {mine.map((v) => (
                <span key={v.id} onClick={() => setVehicleId(v.id)} style={chip(vehicleId === v.id)}>
                  {v.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={labelStyle}>Pieza / servicio</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {services.map((s) => (
                <span key={s} onClick={() => setService(s)} style={chip(service === s)}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Fecha</div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Kilometraje</div>
              <input value={odometer} onChange={(e) => setOdometer(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <div style={labelStyle}>Lugar</div>
            <div style={{ display: "flex", gap: 7 }}>
              <span onClick={() => setPlace("taller")} style={chip(place === "taller")}>
                Taller
              </span>
              <span onClick={() => setPlace("particular")} style={chip(place === "particular")}>
                Particular / yo mismo
              </span>
            </div>
          </div>

          <div>
            <div style={labelStyle}>Piezas cambiadas</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
              {parts.map((p) => (
                <span
                  key={p}
                  onClick={() => removePart(p)}
                  className="cf-mono"
                  style={{
                    padding: "7px 11px",
                    borderRadius: 9,
                    background: "var(--cf-surface-2)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {p} ✕
                </span>
              ))}
              <input
                value={newPart}
                onChange={(e) => setNewPart(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPart()}
                placeholder="+ pieza"
                style={{ ...inputStyle, width: 96, padding: "7px 11px", fontSize: 12 }}
              />
            </div>
          </div>

          <div style={{ border: "1px solid var(--cf-border)", borderRadius: 14, background: "var(--cf-surface)", padding: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>Programar próximo cambio</span>
              <span
                onClick={() => setScheduleNext((s) => !s)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 99,
                  background: scheduleNext ? "var(--cf-accent)" : "var(--cf-surface-2)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background .2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: scheduleNext ? 18 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: 99,
                    background: "#fff",
                    transition: "left .2s",
                  }}
                />
              </span>
            </div>
            {scheduleNext && (
              <>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={labelStyle}>Cada (km)</div>
                    <input value={everyKm} onChange={(e) => setEveryKm(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={labelStyle}>o cada (meses)</div>
                    <input value={everyMonths} onChange={(e) => setEveryMonths(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-accent)", marginTop: 9 }}>
                  → te avisamos por lo que ocurra primero
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--cf-border)" }}>
        <button
          onClick={save}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 14,
            border: "none",
            background: "var(--cf-accent)",
            color: "var(--cf-on-accent)",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Guardar mantención
        </button>
      </div>
    </div>
  );
}
