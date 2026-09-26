import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "@cf/types";
import { api } from "../api";

const etiqueta: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 5, fontWeight: 500 };
const campo: React.CSSProperties = { width: "100%", borderRadius: 11, padding: "11px 13px", fontSize: 13.5 };

const tipos: { valor: Vehicle["kind"]; label: string }[] = [
  { valor: "auto", label: "Auto" },
  { valor: "moto", label: "Moto" },
  { valor: "camion", label: "Camión" },
  { valor: "maquinaria", label: "Maquinaria" },
];

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
    <form onSubmit={guardar} style={{ padding: "14px 20px", maxWidth: 460 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <span onClick={() => navigate("/")} style={{ fontSize: 18, cursor: "pointer" }} role="button" aria-label="Cerrar">
          ✕
        </span>
        <span className="cf-display" style={{ fontWeight: 600, fontSize: 18 }}>
          Agregar vehículo
        </span>
      </div>

      <div style={etiqueta}>Vehículo</div>
      <input
        className="cf-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Toyota Hilux"
        required
        style={{ ...campo, marginBottom: 13 }}
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 13 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={etiqueta}>Patente</div>
          <input
            className="cf-input cf-mono"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="ABCD12"
            required
            minLength={4}
            style={campo}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={etiqueta}>Kilometraje</div>
          <input
            className="cf-input cf-mono"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="84320"
            style={campo}
          />
        </div>
      </div>

      <div style={etiqueta}>Tipo</div>
      <select
        className="cf-input"
        value={kind}
        // El valor de un <select> es string: en vez de afirmar que es un kind, se busca
        // en la lista de la que salieron las opciones. Sin `as` y sin confiar en el DOM.
        onChange={(e) => {
          const elegido = tipos.find((t) => t.valor === e.target.value);
          if (elegido) setKind(elegido.valor);
        }}
        style={{ ...campo, marginBottom: error ? 12 : 18 }}
      >
        {tipos.map((t) => (
          <option key={t.valor} value={t.valor}>
            {t.label}
          </option>
        ))}
      </select>

      {error && (
        <div role="alert" style={{ fontSize: 12.5, color: "var(--cf-danger)", marginBottom: 14, lineHeight: 1.45 }}>
          {error}
        </div>
      )}

      <button
        className="cf-btn"
        type="submit"
        disabled={guardando}
        style={{ width: "100%", height: 46, borderRadius: 13, fontSize: 14.5, opacity: guardando ? 0.6 : 1 }}
      >
        {guardando ? "Guardando…" : "Agregar vehículo"}
      </button>

      <p style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--cf-dim)", margin: "14px 0 0" }}>
        El vehículo parte con las reglas de recordatorio de su tipo: auto, moto, camión o maquinaria. Los avisos
        empiezan a contar desde el primer trabajo que registres.
      </p>
    </form>
  );
}
