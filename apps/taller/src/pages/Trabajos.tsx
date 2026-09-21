import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthorPill } from "@cf/ui";
import type { MaintenanceRecord, Vehicle } from "@cf/types";
import { api, useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { formatDate, km } from "../format";

// Pasa las 200 líneas a propósito: el formulario y la lista que se actualiza al guardar
// son la misma pantalla. Separarlos obligaría a subir el estado a un padre que no hace
// nada más que sostenerlo.

const label: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 6, fontWeight: 500 };
const input: React.CSSProperties = { borderRadius: 10, padding: "10px 12px", fontSize: 13, width: "100%" };

export function Trabajos() {
  const flota = useApi<Vehicle[]>("/taller/vehiculos");
  const historial = useApi<MaintenanceRecord[]>("/taller/trabajos");

  // La ficha del vehículo entra acá con ?vehiculo=<id> para no obligar a re-elegirlo.
  const [params] = useSearchParams();
  const desdeFicha = params.get("vehiculo");

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [title, setTitle] = useState("Cambio de aceite + filtro");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState("");
  const [partsText, setPartsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  if (flota.cargando || historial.cargando) return <Cargando que="los trabajos" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (historial.error) return <ErrorApi mensaje={historial.error} onReintentar={historial.recargar} />;

  const vehiculos = flota.datos ?? [];
  const trabajos = historial.datos ?? [];

  if (vehiculos.length === 0) {
    return (
      <>
        <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
          Trabajos
        </div>
        <div
          style={{
            border: "1px dashed var(--cf-border)",
            borderRadius: 14,
            padding: "30px 20px",
            marginTop: 18,
            textAlign: "center",
            fontSize: 13,
            color: "var(--cf-dim)",
            lineHeight: 1.6,
          }}
        >
          No hay vehículos en seguimiento, así que no hay dónde registrar un trabajo.
          <br />
          Cargá un cliente y su vehículo en <strong style={{ color: "var(--cf-accent)" }}>Clientes</strong>.
        </div>
      </>
    );
  }

  // El id de la URL solo vale si ese vehículo es de la cartera: uno ajeno o inventado
  // cae al primero de la lista, y el servidor igual respondería 404 al guardar.
  const elegido =
    vehicleId ?? (vehiculos.some((v) => v.id === desdeFicha) ? desdeFicha! : vehiculos[0].id);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      // `place` no se manda: lo registra un taller, así que se hizo en un taller y lo
      // pone el servidor. El autor y la firma salen del token, no del formulario, y si
      // el kilometraje es mayor que el del vehículo lo sube en la misma transacción.
      await api(`/taller/vehiculos/${elegido}/mantenciones`, {
        metodo: "POST",
        cuerpo: {
          title: title.trim(),
          date,
          odometer: Number(odometer.replace(/\./g, "")) || 0,
          parts: partsText.split(",").map((p) => p.trim()).filter(Boolean),
        },
      });
      setOdometer("");
      setPartsText("");
      // Recargar las dos: el trabajo nuevo entra al historial y el odómetro del vehículo
      // pudo haber subido con él.
      historial.recargar();
      flota.recargar();
      setGuardando(false);
    } catch (err) {
      setError((err as Error).message);
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Trabajos
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        Registra un trabajo — queda firmado por el taller en el historial del vehículo, y el dueño lo ve desde su app.
      </div>

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
        <form
          onSubmit={guardar}
          style={{
            flex: "1 1 320px",
            border: "1px solid var(--cf-border)",
            borderRadius: 16,
            background: "var(--cf-surface)",
            padding: 20,
          }}
        >
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Registrar trabajo
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={label}>Vehículo</div>
              <select className="cf-input" value={elegido} onChange={(e) => setVehicleId(e.target.value)} style={input}>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.plate} · {v.ownerName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={label}>Trabajo / servicio</div>
              <input
                className="cf-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={input}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={label}>Fecha</div>
                <input
                  className="cf-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={input}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={label}>Kilometraje</div>
                <input
                  className="cf-input cf-mono"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="92000"
                  style={input}
                />
              </div>
            </div>
            <div>
              <div style={label}>Piezas (separadas por coma)</div>
              <input
                className="cf-input"
                value={partsText}
                onChange={(e) => setPartsText(e.target.value)}
                placeholder="Aceite 5W-30, Filtro aceite"
                style={input}
              />
            </div>

            {error && (
              <div role="alert" style={{ fontSize: 12.5, color: "var(--cf-danger)", lineHeight: 1.45 }}>
                {error}
              </div>
            )}

            <button
              className="cf-btn"
              type="submit"
              disabled={guardando}
              style={{ height: 44, borderRadius: 12, fontSize: 14, opacity: guardando ? 0.6 : 1 }}
            >
              {guardando ? "Guardando…" : "Guardar trabajo"}
            </button>
          </div>
        </form>

        <div style={{ flex: "1.1 1 320px", minWidth: 0 }}>
          <div
            className="cf-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: "var(--cf-dim)",
              marginBottom: 10,
            }}
          >
            Trabajos recientes
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {trabajos.map((r) => {
              const v = vehiculos.find((x) => x.id === r.vehicleId);
              return (
                <div
                  key={r.id}
                  style={{ border: "1px solid var(--cf-border)", borderRadius: 14, background: "var(--cf-surface)", padding: 14 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</span>
                    <span className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", whiteSpace: "nowrap" }}>
                      {v?.name ?? "—"}
                    </span>
                  </div>
                  <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", marginBottom: 8 }}>
                    {formatDate(r.date)} · {km(r.odometer)} km
                    {r.parts.length > 0 && ` · ${r.parts.join(", ")}`}
                  </div>
                  <AuthorPill role={r.author.role} name={r.author.name} />
                </div>
              );
            })}
            {trabajos.length === 0 && (
              <div style={{ fontSize: 12.5, color: "var(--cf-dim)", padding: "18px 2px" }}>
                Todavía no hay trabajos registrados en la cartera.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
