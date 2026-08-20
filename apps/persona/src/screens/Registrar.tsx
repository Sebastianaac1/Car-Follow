import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "@cf/types";
import { api, useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";

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
  const flota = useApi<Vehicle[]>("/vehiculos");

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [service, setService] = useState("Aceite motor");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState("");
  const [place, setPlace] = useState<"taller" | "particular">("taller");
  const [parts, setParts] = useState<string[]>([]);
  const [newPart, setNewPart] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const removePart = (p: string) => setParts((prev) => prev.filter((x) => x !== p));
  const addPart = () => {
    const t = newPart.trim();
    if (t) {
      setParts((prev) => [...prev, t]);
      setNewPart("");
    }
  };

  if (flota.cargando) return <Cargando que="tus vehículos" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;

  const mine = flota.datos ?? [];
  if (mine.length === 0) {
    return (
      <div style={{ padding: 20, fontSize: 13, color: "var(--cf-dim)", lineHeight: 1.5 }}>
        Necesitas al menos un vehículo para registrar una mantención.
      </div>
    );
  }

  const elegido = vehicleId ?? mine[0].id;

  const save = async () => {
    setGuardando(true);
    setErrorGuardar(null);
    try {
      // El autor y la fecha de firma los pone el servidor desde el token: acá no se
      // mandan, justamente para que no se pueda firmar historial a nombre de otro.
      // El trabajo nace con su revisión y, si el kilometraje es mayor, sube el del
      // vehículo en la misma operación.
      await api(`/vehiculos/${elegido}/mantenciones`, {
        metodo: "POST",
        cuerpo: {
          title: service === "+ otro" ? "Mantención" : service,
          date,
          odometer: Number(odometer.replace(/\./g, "")) || 0,
          place,
          parts,
        },
      });
      navigate(`/vehiculo/${elegido}`);
    } catch (e) {
      setErrorGuardar((e as Error).message);
      setGuardando(false);
    }
  };

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
                <span key={v.id} onClick={() => setVehicleId(v.id)} style={chip(elegido === v.id)}>
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

          {/* Acá había un bloque "Programar próximo cambio" con los intervalos. Se fue:
              los intervalos ahora viven en las reglas de cada vehículo, no en el trabajo
              que se registra, y el vehículo ya nace con las de su tipo. Editarlas es la
              pantalla de reglas, que todavía es de solo lectura. */}
          <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)", lineHeight: 1.5 }}>
            → el próximo aviso sale solo, desde las reglas de este vehículo
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--cf-border)" }}>
        {errorGuardar && (
          <div role="alert" style={{ fontSize: 12, color: "var(--cf-danger)", marginBottom: 10, lineHeight: 1.45 }}>
            {errorGuardar}
          </div>
        )}
        <button
          onClick={save}
          disabled={guardando}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 14,
            border: "none",
            background: "var(--cf-accent)",
            color: "var(--cf-on-accent)",
            fontWeight: 600,
            fontSize: 15,
            cursor: guardando ? "default" : "pointer",
            opacity: guardando ? 0.6 : 1,
          }}
        >
          {guardando ? "Guardando…" : "Guardar mantención"}
        </button>
      </div>
    </div>
  );
}
