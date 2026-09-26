import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthorPill, Patente } from "@cf/ui";
import type { MaintenanceRecord, Vehicle } from "@cf/types";
import { api, useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { formatDate, km } from "../format";

export function Trabajos() {
  const flota = useApi<Vehicle[]>("/taller/vehiculos");
  const historial = useApi<MaintenanceRecord[]>("/taller/trabajos");

  // La ficha del vehículo entra acá con ?vehiculo=<id> para no obligar a re-elegirlo.
  const [params] = useSearchParams();
  const desdeFicha = params.get("vehiculo");

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [title, setTitle] = useState("Cambio de aceite y filtro");
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
        <h1 className="cf-display" style={{ fontSize: 40, margin: "0 0 20px" }}>
          Trabajos
        </h1>
        <div className="cf-panel" style={{ padding: "24px 20px", maxWidth: 560 }}>
          <div style={{ fontWeight: 600 }}>Todavía no hay vehículos en seguimiento</div>
          <p style={{ margin: "4px 0 0", color: "var(--cf-dim)" }}>
            Para registrar un trabajo, agrega un cliente y su vehículo en <Link to="/clientes">Clientes</Link>.
          </p>
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
      <h1 className="cf-display" style={{ fontSize: 40, margin: 0 }}>
        Trabajos
      </h1>
      <p style={{ color: "var(--cf-dim)", margin: "6px 0 24px" }}>
        Registra un trabajo. Queda firmado por el taller en el historial del vehículo y el dueño lo ve en su app.
      </p>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
        <form onSubmit={guardar} className="cf-panel" style={{ flex: "1 1 340px", padding: 22, position: "sticky", top: 24 }}>
          <h2 className="cf-display" style={{ fontSize: 24, margin: "0 0 18px" }}>
            Registrar trabajo
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="cf-etiqueta" htmlFor="tr-vehiculo">
                Vehículo
              </label>
              <select id="tr-vehiculo" className="cf-input" value={elegido} onChange={(e) => setVehicleId(e.target.value)}>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate}, {v.name} ({v.ownerName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="cf-etiqueta" htmlFor="tr-titulo">
                Trabajo o servicio
              </label>
              <input id="tr-titulo" className="cf-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label className="cf-etiqueta" htmlFor="tr-fecha">
                  Fecha
                </label>
                <input id="tr-fecha" className="cf-input cf-num" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label className="cf-etiqueta" htmlFor="tr-km">
                  Kilometraje
                </label>
                <input
                  id="tr-km"
                  className="cf-input cf-num"
                  inputMode="numeric"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="92000"
                />
              </div>
            </div>
            <div>
              <label className="cf-etiqueta" htmlFor="tr-piezas">
                Piezas, separadas por coma
              </label>
              <input
                id="tr-piezas"
                className="cf-input"
                value={partsText}
                onChange={(e) => setPartsText(e.target.value)}
                placeholder="Aceite 5W-30, filtro de aceite"
              />
            </div>

            {error && (
              <div role="alert" style={{ fontSize: 14.5, color: "var(--cf-danger)" }}>
                {error}
              </div>
            )}

            <button className="cf-btn" type="submit" disabled={guardando} style={{ height: 46 }}>
              {guardando ? "Guardando…" : "Guardar trabajo"}
            </button>
          </div>
        </form>

        <section style={{ flex: "1.2 1 380px", minWidth: 0 }}>
          <h2 className="cf-display" style={{ fontSize: 24, margin: "0 0 12px" }}>
            Trabajos recientes
          </h2>
          {trabajos.length === 0 ? (
            <p style={{ color: "var(--cf-dim)" }}>Todavía no hay trabajos registrados en la cartera.</p>
          ) : (
            <div className="cf-panel cf-lista">
              {trabajos.map((r) => {
                const v = vehiculos.find((x) => x.id === r.vehicleId);
                return (
                  <div key={r.id} style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{r.title}</span>
                      {v && <Patente valor={v.plate} alto={22} />}
                    </div>
                    <div className="cf-num" style={{ fontSize: 14, color: "var(--cf-dim)", marginBottom: 8 }}>
                      {v?.name ?? "Vehículo"}, {formatDate(r.date)}, {km(r.odometer)} km
                      {r.parts.length > 0 && `. Piezas: ${r.parts.join(", ")}`}
                    </div>
                    <AuthorPill role={r.author.role} name={r.author.name} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
