import { useState } from "react";
import type { Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { DetailBody } from "./DetailBody";

export function Historial() {
  const flota = useApi<Vehicle[]>("/vehiculos");
  // Cuál pestaña está elegida. Empieza en null y cae al primer vehículo cuando llegan:
  // guardar el id en el estado inicial no sirve, porque al montar todavía no hay lista.
  const [selected, setSelected] = useState<string | null>(null);

  if (flota.cargando) return <Cargando que="tus vehículos" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;

  const mine = flota.datos ?? [];
  if (mine.length === 0) {
    return <p style={{ color: "var(--cf-dim)" }}>Todavía no tienes vehículos, así que no hay historial que mostrar.</p>;
  }

  const actual = selected ?? mine[0].id;

  return (
    <>
      {/* Duplicado a propósito con Reglas.tsx: dos pantallas que eligen vehículo, no tres. */}
      <div role="group" aria-label="Vehículo" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
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
      <DetailBody vehicleId={actual} />
    </>
  );
}

