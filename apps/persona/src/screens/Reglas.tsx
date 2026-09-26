import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiArrowLeft } from "react-icons/pi";
import type { PartRule, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { km } from "../format";

export function Reglas() {
  const navigate = useNavigate();
  const flota = useApi<Vehicle[]>("/vehiculos");
  const [selected, setSelected] = useState<string | null>(null);

  if (flota.cargando) return <Cargando que="tus vehículos" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;

  const mine = flota.datos ?? [];
  const actual = selected ?? mine[0]?.id ?? null;

  return (
    <div style={{ maxWidth: 640 }}>
      <button className="cf-btn-quieto" onClick={() => navigate("/perfil")} style={{ height: 34, padding: "0 12px", marginBottom: 20 }}>
        <PiArrowLeft aria-hidden />
        Perfil
      </button>
      <h1 className="cf-display" style={{ fontSize: 40, margin: "0 0 6px" }}>
        Reglas por pieza
      </h1>
      <p style={{ margin: "0 0 24px", color: "var(--cf-dim)" }}>
        Cada vehículo tiene sus propios intervalos, porque una moto no se mantiene igual que un camión. El aviso salta
        por km o por tiempo, lo que ocurra primero.
      </p>

      {mine.length === 0 ? (
        <p style={{ color: "var(--cf-dim)" }}>Todavía no tienes vehículos. Las reglas se crean solas al registrar el primero.</p>
      ) : (
        <>
          {/* Duplicado a propósito con Historial.tsx: dos pantallas que eligen vehículo, no tres. */}
          <div role="group" aria-label="Vehículo" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {mine.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                aria-pressed={v.id === actual}
                className={v.id === actual ? undefined : "cf-tap"}
                style={{
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 8,
                  font: "inherit",
                  fontSize: 14.5,
                  fontWeight: v.id === actual ? 600 : 500,
                  border: `1px solid ${v.id === actual ? "var(--cf-text)" : "var(--cf-border)"}`,
                  background: v.id === actual ? "var(--cf-text)" : "var(--cf-surface)",
                  color: v.id === actual ? "var(--cf-bg)" : "var(--cf-text)",
                }}
              >
                {v.name}
              </button>
            ))}
          </div>
          {actual && <ReglasDelVehiculo vehiculoId={actual} />}
        </>
      )}
    </div>
  );
}

/**
 * Va en su propio componente para que cambiar de pestaña vuelva a pedir: el hook depende
 * de la ruta, y la ruta lleva el id del vehículo.
 */
function ReglasDelVehiculo({ vehiculoId }: { vehiculoId: string }) {
  const reglas = useApi<PartRule[]>(`/vehiculos/${vehiculoId}/reglas`);

  if (reglas.cargando) return <Cargando que="las reglas" />;
  if (reglas.error) return <ErrorApi mensaje={reglas.error} onReintentar={reglas.recargar} />;

  return (
    <>
      <div className="cf-panel cf-lista">
        {(reglas.datos ?? []).map((r) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "14px 18px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600 }}>{r.part}</span>
            <span className="cf-num" style={{ color: "var(--cf-dim)" }}>
              {cadaCuanto(r)}
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 14, color: "var(--cf-dim)", marginTop: 12 }}>
        Por ahora solo se pueden ver. Todavía no se pueden editar ni agregar reglas propias.
      </p>
    </>
  );
}

/** "Cada 10.000 km o 6 meses", "Cada 10.000 km" o "Cada 6 meses". */
function cadaCuanto(r: PartRule): string {
  const partes = [r.intervalKm ? `${km(r.intervalKm)} km` : null, r.intervalMonths ? `${r.intervalMonths} meses` : null];
  const hay = partes.filter(Boolean);
  return hay.length === 0 ? "Sin intervalo" : `Cada ${hay.join(" o ")}`;
}

