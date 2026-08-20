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
    return (
      <div style={{ padding: "20px", fontSize: 13, color: "var(--cf-dim)", lineHeight: 1.5 }}>
        Todavía no tienes vehículos, así que no hay historial que mostrar.
      </div>
    );
  }

  const actual = selected ?? mine[0].id;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 7, padding: "14px 20px 4px", flexWrap: "wrap" }}>
        {mine.map((v) => {
          const on = v.id === actual;
          return (
            <span
              key={v.id}
              onClick={() => setSelected(v.id)}
              style={{
                padding: "7px 12px",
                borderRadius: 10,
                fontSize: 12.5,
                cursor: "pointer",
                border: `1px solid ${on ? "var(--cf-accent)" : "var(--cf-border)"}`,
                background: on ? "var(--cf-accent-soft)" : "var(--cf-surface)",
                color: on ? "var(--cf-accent)" : "var(--cf-dim)",
                fontWeight: on ? 600 : 400,
              }}
            >
              {v.name}
            </span>
          );
        })}
      </div>
      <DetailBody vehicleId={actual} />
    </div>
  );
}
