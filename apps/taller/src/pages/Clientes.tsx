import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PiPlus, PiX } from "react-icons/pi";
import { ordenDeTipos, Patente, tiposDeVehiculo } from "@cf/ui";
import type { Client, Vehicle } from "@cf/types";
import { api, useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { km } from "../format";

// Pasa las 200 líneas a propósito: son la lista y los dos formularios que la llenan.
// Sacar los formularios a archivos propios no bajaría la complejidad de nada —los usa
// solo esta pantalla— y rompería la regla de no crear indirecciones de un solo uso.

export function Clientes() {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 className="cf-display" style={{ fontSize: 40, margin: 0 }}>
            Clientes
          </h1>
          <div className="cf-num" style={{ color: "var(--cf-dim)", marginTop: 6 }}>
            {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"} con vehículos en seguimiento
          </div>
        </div>
        <button className={abierto === "nuevo" ? "cf-btn-quieto" : "cf-btn"} onClick={() => setAbierto(abierto === "nuevo" ? null : "nuevo")}>
          {abierto === "nuevo" ? <PiX aria-hidden /> : <PiPlus aria-hidden />}
          {abierto === "nuevo" ? "Cancelar" : "Nuevo cliente"}
        </button>
      </div>

      {abierto === "nuevo" && <FormularioCliente onListo={recargarTodo} />}

      {clientes.length === 0 && abierto !== "nuevo" && (
        <div className="cf-panel" style={{ padding: "24px 20px", maxWidth: 560 }}>
          <div style={{ fontWeight: 600 }}>Todavía no hay clientes en la cartera</div>
          <p style={{ margin: "4px 0 0", color: "var(--cf-dim)" }}>
            Agrega el primero con Nuevo cliente. No necesita cuenta en Car Follow para que le lleves el historial.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {clientes.map((c) => (
          <div key={c.id} className="cf-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div
                aria-hidden
                className="cf-display"
                style={{
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: "2px solid var(--cf-persona)",
                  color: "var(--cf-persona)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</div>
                <div className="cf-num" style={{ fontSize: 14, color: "var(--cf-dim)" }}>
                  {c.phone || "Sin teléfono"}
                </div>
              </div>
            </div>

            <div className="cf-lista" style={{ borderTop: "1px solid var(--cf-border)", marginBottom: 12 }}>
              {c.vehicleIds.map((id) => {
                const v = vehiculos.find((x) => x.id === id);
                if (!v) return null;
                return (
                  <Link
                    key={id}
                    to={`/vehiculos/${id}`}
                    className="cf-tap"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", color: "inherit", textDecoration: "none" }}
                  >
                    <Patente valor={v.plate} alto={22} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14.5 }}>{v.name}</span>
                    <span className="cf-num" style={{ fontSize: 13.5, color: "var(--cf-dim)", whiteSpace: "nowrap" }}>
                      {km(v.odometer)} km
                    </span>
                  </Link>
                );
              })}
              {c.vehicleIds.length === 0 && (
                <div style={{ padding: "10px 4px", fontSize: 14, color: "var(--cf-dim)" }}>Sin vehículos cargados todavía.</div>
              )}
            </div>

            {abierto === c.id ? (
              <FormularioVehiculo clienteId={c.id} onListo={recargarTodo} onCancelar={() => setAbierto(null)} />
            ) : (
              <button className="cf-btn-quieto" onClick={() => setAbierto(c.id)} style={{ width: "100%", height: 36 }}>
                <PiPlus aria-hidden />
                Agregar vehículo
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
    <form onSubmit={enviar} className="cf-panel" style={{ padding: 20, marginBottom: 24, maxWidth: 520 }}>
      <h2 className="cf-display" style={{ fontSize: 24, margin: "0 0 16px" }}>
        Nuevo cliente
      </h2>

      <label className="cf-etiqueta" htmlFor="cli-nombre">
        Nombre
      </label>
      <input id="cli-nombre" className="cf-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Lucía M." required style={{ marginBottom: 16 }} />

      <label className="cf-etiqueta" htmlFor="cli-fono">
        Teléfono (opcional)
      </label>
      <input
        id="cli-fono"
        className="cf-input cf-num"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+56 9 1234 5678"
        style={{ marginBottom: error ? 12 : 20 }}
      />

      {error && (
        <div role="alert" style={{ fontSize: 14.5, color: "var(--cf-danger)", marginBottom: 14 }}>
          {error}
        </div>
      )}

      <button className="cf-btn" type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar cliente"}
      </button>

      <p style={{ fontSize: 14, color: "var(--cf-dim)", margin: "14px 0 0" }}>
        El cliente no necesita cuenta en Car Follow para que registres su historial. Si después crea una cuenta, por
        ahora no se puede enlazar con esta ficha.
      </p>
    </form>
  );
}

function FormularioVehiculo({ clienteId, onListo, onCancelar }: { clienteId: string; onListo: () => void; onCancelar: () => void }) {
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
    <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div role="group" aria-label="Tipo de vehículo" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {ordenDeTipos.map((t) => {
          const { label, Icono } = tiposDeVehiculo[t];
          const activo = kind === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setKind(t)}
              aria-pressed={activo}
              title={label}
              className={activo ? undefined : "cf-tap"}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 2px",
                borderRadius: 8,
                font: "inherit",
                fontSize: 12.5,
                fontWeight: activo ? 600 : 500,
                border: `1px solid ${activo ? "var(--cf-accent)" : "var(--cf-border)"}`,
                background: activo ? "var(--cf-accent-soft)" : "var(--cf-surface)",
                color: activo ? "var(--cf-accent)" : "var(--cf-text)",
              }}
            >
              <Icono aria-hidden size={22} />
              {label}
            </button>
          );
        })}
      </div>

      <input className="cf-input" aria-label="Vehículo" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vehículo, por ejemplo Toyota Hilux" required />

      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="cf-input cf-display"
          aria-label="Patente"
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder="Patente"
          required
          minLength={4}
          style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.06em" }}
        />
        <input
          className="cf-input cf-num"
          aria-label="Kilometraje"
          inputMode="numeric"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          placeholder="Kilometraje"
        />
      </div>

      {error && (
        <div role="alert" style={{ fontSize: 14, color: "var(--cf-danger)" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="cf-btn" type="submit" disabled={enviando} style={{ flex: 1 }}>
          {enviando ? "Guardando…" : "Guardar vehículo"}
        </button>
        <button type="button" className="cf-btn-quieto" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
