import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Client, Vehicle } from "@cf/types";
import { api, useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { km } from "../format";

// Pasa las 200 líneas a propósito: son la lista y los dos formularios que la llenan.
// Sacar los formularios a archivos propios no bajaría la complejidad de nada —los usa
// solo esta pantalla— y rompería la regla de no crear indirecciones de un solo uso.

const card: React.CSSProperties = {
  border: "1px solid var(--cf-border)",
  borderRadius: 14,
  background: "var(--cf-surface)",
  padding: 16,
};

const etiqueta: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 5, fontWeight: 500 };
const campo: React.CSSProperties = { width: "100%", borderRadius: 9, padding: "9px 11px", fontSize: 13 };

const tipos: { valor: Vehicle["kind"]; label: string }[] = [
  { valor: "auto", label: "Auto" },
  { valor: "moto", label: "Moto" },
  { valor: "camion", label: "Camión" },
  { valor: "maquinaria", label: "Maquinaria" },
];

export function Clientes() {
  const navigate = useNavigate();
  const cartera = useApi<Client[]>("/taller/clientes");
  const flota = useApi<Vehicle[]>("/taller/vehiculos");

  // Qué formulario está abierto: "nuevo" para el de cliente, o el id del cliente al que
  // se le está cargando un vehículo. Uno solo a la vez.
  const [abierto, setAbierto] = useState<string | null>(null);

  if (cartera.cargando || flota.cargando) return <Cargando que="los clientes" />;
  if (cartera.error) return <ErrorApi mensaje={cartera.error} onReintentar={cartera.recargar} />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;

  const clientes = cartera.datos ?? [];
  const vehiculos = flota.datos ?? [];

  // Después de crear algo hay que volver a pedir las dos listas: el cliente nuevo cambia
  // la cartera y el vehículo nuevo cambia las dos (aparece en la flota y en vehicleIds).
  const recargarTodo = () => {
    cartera.recargar();
    flota.recargar();
    setAbierto(null);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 22 }}>
        <div>
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
            Clientes
          </div>
          <div style={{ fontSize: 12.5, color: "var(--cf-dim)" }}>
            {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"} con vehículos en seguimiento
          </div>
        </div>
        <button
          className="cf-btn"
          onClick={() => setAbierto(abierto === "nuevo" ? null : "nuevo")}
          style={{ padding: "9px 16px", borderRadius: 10, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {abierto === "nuevo" ? "Cancelar" : "+ Nuevo cliente"}
        </button>
      </div>

      {abierto === "nuevo" && <FormularioCliente onListo={recargarTodo} />}

      {clientes.length === 0 && abierto !== "nuevo" && (
        <div
          style={{
            border: "1px dashed var(--cf-border)",
            borderRadius: 14,
            padding: "30px 20px",
            textAlign: "center",
            fontSize: 13,
            color: "var(--cf-dim)",
            lineHeight: 1.6,
          }}
        >
          Todavía no hay clientes en la cartera.
          <br />
          Agrega el primero con <strong style={{ color: "var(--cf-accent)" }}>+ Nuevo cliente</strong>. No necesita
          cuenta en Car Follow para que le lleves el historial.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {clientes.map((c) => (
          <div key={c.id} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 12,
                  background: "var(--cf-persona-soft)",
                  color: "var(--cf-persona)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)" }}>
                  {c.phone || "sin teléfono"} · {c.vehicleIds.length}{" "}
                  {c.vehicleIds.length === 1 ? "vehículo" : "vehículos"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {c.vehicleIds.map((id) => {
                const v = vehiculos.find((x) => x.id === id);
                if (!v) return null;
                return (
                  <div
                    key={id}
                    className="cf-tap"
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/vehiculos/${id}`)}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/vehiculos/${id}`)}
                    style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}
                  >
                    <span>{v.name}</span>
                    <span className="cf-mono" style={{ color: "var(--cf-dim)", whiteSpace: "nowrap" }}>
                      {v.plate} · {km(v.odometer)} km
                    </span>
                  </div>
                );
              })}
              {c.vehicleIds.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--cf-dim)" }}>Sin vehículos cargados todavía.</div>
              )}
            </div>

            {abierto === c.id ? (
              <FormularioVehiculo clienteId={c.id} onListo={recargarTodo} />
            ) : (
              <button
                className="cf-tap"
                onClick={() => setAbierto(c.id)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontFamily: "inherit",
                  border: "1px solid var(--cf-border)",
                  background: "var(--cf-bg)",
                  color: "var(--cf-text)",
                  cursor: "pointer",
                }}
              >
                + Vehículo
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* Los dos formularios están duplicados a propósito: comparten la forma pero no los
   campos, la ruta ni los errores posibles. Son dos usos, no tres. */

function FormularioCliente({ onListo }: { onListo: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      // El WorkshopClient se engancha en el mismo create del servidor: el cliente nace
      // ya asociado a este taller y a ningún otro.
      await api("/taller/clientes", {
        metodo: "POST",
        cuerpo: { name: name.trim(), ...(phone.trim() ? { phone: phone.trim() } : {}) },
      });
      onListo();
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} style={{ ...card, marginBottom: 18, maxWidth: 460 }}>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>
        Nuevo cliente
      </div>

      <div style={etiqueta}>Nombre</div>
      <input
        className="cf-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Lucía M."
        required
        style={{ ...campo, marginBottom: 12 }}
      />

      <div style={etiqueta}>Teléfono (opcional)</div>
      <input
        className="cf-input cf-mono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+56 9 1234 5678"
        style={{ ...campo, marginBottom: error ? 10 : 16 }}
      />

      {error && (
        <div role="alert" style={{ fontSize: 12, color: "var(--cf-danger)", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button
        className="cf-btn"
        type="submit"
        disabled={enviando}
        style={{ padding: "9px 16px", borderRadius: 10, fontSize: 13, opacity: enviando ? 0.6 : 1 }}
      >
        {enviando ? "Guardando…" : "Guardar cliente"}
      </button>

      <p style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--cf-dim)", margin: "12px 0 0" }}>
        El cliente no necesita cuenta en Car Follow para que registres su historial. Si después crea una cuenta, por
        ahora no se puede enlazar con esta ficha.
      </p>
    </form>
  );
}

function FormularioVehiculo({ clienteId, onListo }: { clienteId: string; onListo: () => void }) {
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [kind, setKind] = useState<Vehicle["kind"]>("auto");
  const [odometer, setOdometer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      // El servidor comprueba que este cliente sea de este taller antes de crear nada, y
      // el vehículo nace con las reglas por pieza de su tipo.
      await api(`/taller/clientes/${clienteId}/vehiculos`, {
        metodo: "POST",
        cuerpo: {
          name: name.trim(),
          plate: plate.trim(),
          kind,
          odometer: Number(odometer.replace(/\./g, "")) || 0,
        },
      });
      onListo();
    } catch (err) {
      setError((err as Error).message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} style={{ borderTop: "1px solid var(--cf-border)", paddingTop: 12 }}>
      <div style={etiqueta}>Vehículo</div>
      <input
        className="cf-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Toyota Hilux"
        required
        style={{ ...campo, marginBottom: 10 }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
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
        style={{ ...campo, marginBottom: error ? 10 : 12 }}
      >
        {tipos.map((t) => (
          <option key={t.valor} value={t.valor}>
            {t.label}
          </option>
        ))}
      </select>

      {error && (
        <div role="alert" style={{ fontSize: 12, color: "var(--cf-danger)", marginBottom: 10 }}>
          {error}
        </div>
      )}

      <button
        className="cf-btn"
        type="submit"
        disabled={enviando}
        style={{ width: "100%", padding: "9px 14px", borderRadius: 9, fontSize: 12.5, opacity: enviando ? 0.6 : 1 }}
      >
        {enviando ? "Guardando…" : "Guardar vehículo"}
      </button>
    </form>
  );
}
