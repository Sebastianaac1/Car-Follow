import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiInfo, PiX } from "react-icons/pi";
import type { Vehicle } from "@cf/types";
import { api, useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";

// Pasa las 200 líneas a propósito: es un solo formulario de seis campos y lo que lo
// alarga son los estilos inline de cada uno, no lógica que se pueda separar.

function chip(on: boolean): React.CSSProperties {
  return {
    height: 36,
    padding: "0 14px",
    borderRadius: 8,
    font: "inherit",
    fontSize: 14.5,
    fontWeight: on ? 600 : 500,
    border: `1px solid ${on ? "var(--cf-accent)" : "var(--cf-border)"}`,
    background: on ? "var(--cf-accent-soft)" : "var(--cf-surface)",
    color: on ? "var(--cf-accent)" : "var(--cf-text)",
  };
}

const services = ["Aceite motor", "Frenos", "Filtros", "Otro"];

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
    return <p style={{ color: "var(--cf-dim)" }}>Necesitas al menos un vehículo para registrar una mantención.</p>;
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
          title: service === "Otro" ? "Mantención" : service,
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
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <h1 className="cf-display" style={{ fontSize: 36, margin: 0 }}>
          Registrar mantención
        </h1>
        <button className="cf-btn-quieto" onClick={() => navigate("/")} aria-label="Cerrar" style={{ width: 40, padding: 0 }}>
          <PiX aria-hidden />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <span className="cf-etiqueta">Vehículo</span>
          <div role="group" aria-label="Vehículo" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {mine.map((v) => (
              <button key={v.id} onClick={() => setVehicleId(v.id)} aria-pressed={elegido === v.id} style={chip(elegido === v.id)}>
                {v.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="cf-etiqueta">Pieza o servicio</span>
          <div role="group" aria-label="Pieza o servicio" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {services.map((s) => (
              <button key={s} onClick={() => setService(s)} aria-pressed={service === s} style={chip(service === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label className="cf-etiqueta" htmlFor="rm-fecha">
              Fecha
            </label>
            <input id="rm-fecha" className="cf-input cf-num" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label className="cf-etiqueta" htmlFor="rm-km">
              Kilometraje
            </label>
            <input
              id="rm-km"
              className="cf-input cf-num"
              inputMode="numeric"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="84500"
            />
          </div>
        </div>

        <div>
          <span className="cf-etiqueta">Dónde se hizo</span>
          <div role="group" aria-label="Dónde se hizo" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setPlace("taller")} aria-pressed={place === "taller"} style={chip(place === "taller")}>
              En un taller
            </button>
            <button onClick={() => setPlace("particular")} aria-pressed={place === "particular"} style={chip(place === "particular")}>
              Lo hice yo
            </button>
          </div>
        </div>

        <div>
          <label className="cf-etiqueta" htmlFor="rm-pieza">
            Piezas cambiadas
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {parts.map((p) => (
              <span
                key={p}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  height: 34,
                  padding: "0 4px 0 12px",
                  borderRadius: 8,
                  background: "var(--cf-surface-2)",
                  fontSize: 14.5,
                }}
              >
                {p}
                <button
                  onClick={() => removePart(p)}
                  aria-label={`Quitar ${p}`}
                  className="cf-tap"
                  style={{ display: "flex", padding: 6, border: "none", borderRadius: 6, background: "none", color: "var(--cf-dim)" }}
                >
                  <PiX aria-hidden />
                </button>
              </span>
            ))}
            <input
              id="rm-pieza"
              className="cf-input"
              value={newPart}
              onChange={(e) => setNewPart(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPart()}
              onBlur={addPart}
              placeholder="Escribe una pieza y Enter"
              style={{ width: 230, height: 34 }}
            />
          </div>
        </div>

        {/* Acá había un bloque "Programar próximo cambio" con los intervalos. Se fue:
            los intervalos ahora viven en las reglas de cada vehículo, no en el trabajo
            que se registra, y el vehículo ya nace con las de su tipo. Editarlas es la
            pantalla de reglas, que todavía es de solo lectura. */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--cf-dim)" }}>
          <PiInfo aria-hidden size={18} style={{ flexShrink: 0 }} />
          El próximo aviso se calcula solo, con las reglas de este vehículo.
        </div>

        {errorGuardar && (
          <div role="alert" style={{ fontSize: 14.5, color: "var(--cf-danger)" }}>
            {errorGuardar}
          </div>
        )}
        <button className="cf-btn" onClick={save} disabled={guardando} style={{ width: "100%", height: 48 }}>
          {guardando ? "Guardando…" : "Guardar mantención"}
        </button>
      </div>
    </div>
  );
}
