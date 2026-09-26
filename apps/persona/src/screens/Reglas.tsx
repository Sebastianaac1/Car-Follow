import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div style={{ padding: "14px 20px" }}>
      <div style={{ marginBottom: 6 }}>
        <span onClick={() => navigate("/perfil")} style={{ fontSize: 18, cursor: "pointer" }}>
          ‹
        </span>
      </div>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
        Reglas por pieza
      </div>
      <div style={{ fontSize: 12, color: "var(--cf-dim)", marginBottom: 16, lineHeight: 1.5 }}>
        Cada vehículo tiene sus propios intervalos, porque una moto no se mantiene igual que un camión. El aviso salta
        por km o por tiempo, lo que ocurra primero.
      </div>

      {mine.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--cf-dim)", lineHeight: 1.5 }}>
          Todavía no tienes vehículos. Las reglas se crean solas al registrar el primero.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {(reglas.datos ?? []).map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid var(--cf-border)",
            borderRadius: 14,
            background: "var(--cf-surface)",
            padding: "12px 14px",
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 14 }}>{r.part}</div>
          <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", marginTop: 4 }}>
            {r.intervalKm ? `${km(r.intervalKm)} km` : "—"} · {r.intervalMonths ? `${r.intervalMonths} meses` : "—"}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11.5, color: "var(--cf-dim)", lineHeight: 1.5, marginTop: 2 }}>
        Por ahora solo se pueden ver. Todavía no se pueden editar ni agregar reglas propias.
      </div>
    </div>
  );
}
