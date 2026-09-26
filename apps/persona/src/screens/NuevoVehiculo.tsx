import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PiX } from "react-icons/pi";
import { ordenDeTipos, tiposDeVehiculo } from "@cf/ui";
import type { Vehicle } from "@cf/types";
import { api } from "../api";

/**
 * Faltaba: el garaje vacío decía "agrega tu primer vehículo" y el botón llevaba a
 * registrar una mantención, que a su vez pide un vehículo. Una cuenta nueva no tenía
 * forma de salir de ahí.
 */
export function NuevoVehiculo() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [kind, setKind] = useState<Vehicle["kind"]>("auto");
  const [odometer, setOdometer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      // El dueño sale del token, no del formulario. La patente se normaliza a mayúsculas
      // en el servidor y una repetida devuelve 409. El vehículo nace con las reglas por
      // pieza de su tipo, así que los recordatorios empiezan a contar solos.
      const creado = await api<Vehicle>("/vehiculos", {
        metodo: "POST",
        cuerpo: {
          name: name.trim(),
          plate: plate.trim(),
          kind,
          odometer: Number(odometer.replace(/\./g, "")) || 0,
        },
      });
      navigate(`/vehiculo/${creado.id}`, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={guardar} style={{ maxWidth: 520 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <h1 className="cf-display" style={{ fontSize: 36, margin: 0 }}>
          Agregar vehículo
        </h1>
        <button type="button" className="cf-btn-quieto" onClick={() => navigate("/")} aria-label="Cerrar" style={{ width: 40, padding: 0 }}>
          <PiX aria-hidden />
        </button>
      </div>

      <span className="cf-etiqueta">Tipo</span>
      <div role="group" aria-label="Tipo de vehículo" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
        {ordenDeTipos.map((t) => {
          const { label, Icono } = tiposDeVehiculo[t];
          const activo = kind === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setKind(t)}
              aria-pressed={activo}
              className={activo ? undefined : "cf-tap"}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "12px 4px",
                borderRadius: 8,
                font: "inherit",
                fontSize: 14,
                fontWeight: activo ? 600 : 500,
                border: `1px solid ${activo ? "var(--cf-accent)" : "var(--cf-border)"}`,
                background: activo ? "var(--cf-accent-soft)" : "var(--cf-surface)",
                color: activo ? "var(--cf-accent)" : "var(--cf-text)",
              }}
            >
              <Icono aria-hidden size={26} />
              {label}
            </button>
          );
        })}
      </div>

      <label className="cf-etiqueta" htmlFor="nv-nombre">Vehículo</label>
      <input
        id="nv-nombre"
        className="cf-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Toyota Hilux"
        required
        style={{ marginBottom: 18 }}
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label className="cf-etiqueta" htmlFor="nv-patente">Patente</label>
          {/* El campo se escribe como se ve la placa: condensado y en mayúsculas. */}
          <input
            id="nv-patente"
            className="cf-input cf-display"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="BBCL12"
            required
            minLength={4}
            style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.08em" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label className="cf-etiqueta" htmlFor="nv-km">Kilometraje</label>
          <input
            id="nv-km"
            className="cf-input cf-num"
            inputMode="numeric"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="84320"
          />
        </div>
      </div>

      {error && (
        <div role="alert" style={{ fontSize: 14.5, color: "var(--cf-danger)", marginBottom: 14 }}>
          {error}
        </div>
      )}

      <button className="cf-btn" type="submit" disabled={guardando} style={{ width: "100%", height: 46 }}>
        {guardando ? "Guardando…" : "Agregar vehículo"}
      </button>

      <p style={{ fontSize: 14, color: "var(--cf-dim)", margin: "16px 0 0" }}>
        El vehículo parte con las reglas de recordatorio de su tipo: auto, moto, camión o maquinaria. Los avisos
        empiezan a contar desde el primer trabajo que registres.
      </p>
    </form>
  );
}
