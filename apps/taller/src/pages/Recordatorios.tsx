import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@cf/ui";
import { clientById, upcomingFor, vehicleById, vehicles } from "@cf/mock-data";
import type { UpcomingService } from "@cf/types";
import { useData } from "../store";
import { formatDate, km } from "../format";

const microLabel: React.CSSProperties = {
  fontSize: 10.5,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "var(--cf-dim)",
  marginBottom: 10,
  fontFamily: "'IBM Plex Mono', monospace",
};

export function Recordatorios() {
  const navigate = useNavigate();
  const { records } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Un recordatorio por pieza pendiente de cada vehículo. Nada guardado: todo
  // sale de los trabajos registrados y de las reglas por pieza.
  const pendientes = vehicles
    .flatMap((v) => upcomingFor(v.id, records))
    .filter((u) => u.status !== "ok")
    .sort((a, b) => b.progress - a.progress);

  const selected = pendientes.find((u) => u.id === selectedId) ?? pendientes[0];

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Recordatorios
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        {pendientes.length} pendientes · se generan solos con cada trabajo registrado, por km o por tiempo — lo que
        ocurra primero.
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: 1.3, minWidth: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {pendientes.map((u) => {
            const v = vehicleById(u.vehicleId)!;
            const active = selected?.id === u.id;
            return (
              <div
                key={u.id}
                className="cf-tap"
                onClick={() => setSelectedId(u.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "13px 16px",
                  border: `1px solid ${active ? "var(--cf-accent)" : "var(--cf-border)"}`,
                  borderRadius: 12,
                  background: active ? "var(--cf-accent-soft)" : "var(--cf-surface)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      flexShrink: 0,
                      borderRadius: 99,
                      background: u.status === "vencido" ? "var(--cf-danger)" : "var(--cf-warn)",
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {v.name} · {u.part}
                    </div>
                    <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", marginTop: 2 }}>
                      {v.ownerName} · {u.remainingLabel}
                    </div>
                  </div>
                </div>
                <StatusBadge status={u.status} />
              </div>
            );
          })}

          {pendientes.length === 0 && (
            <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--cf-dim)" }}>
              Ningún vehículo tiene mantenciones pendientes.
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>{selected && <PanelAcciones upcoming={selected} onIrAFicha={navigate} />}</div>
      </div>
    </>
  );
}

function PanelAcciones({ upcoming, onIrAFicha }: { upcoming: UpcomingService; onIrAFicha: (to: string) => void }) {
  const vehicle = vehicleById(upcoming.vehicleId)!;
  const client = clientById(vehicle.ownerId);
  const phoneDigits = client?.phone.replace(/\D/g, "") ?? "";

  const mensaje = encodeURIComponent(
    `Hola ${client?.name ?? ""}, le escribimos de Taller CF Norte por su ${vehicle.name} (${vehicle.plate}): ` +
      `${upcoming.part.toLowerCase()} ${upcoming.status === "vencido" ? "está" : "vence en"} ${upcoming.remainingLabel}. ` +
      `¿Le agendamos una hora?`,
  );

  return (
    <div style={{ border: "1px solid var(--cf-border)", borderRadius: 16, background: "var(--cf-surface)", padding: 18 }}>
      <div style={microLabel}>Recordatorio · {vehicle.plate}</div>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 18 }}>
        {upcoming.part}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", margin: "4px 0 16px" }}>
        {vehicle.name} · {km(vehicle.odometer)} km
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5, marginBottom: 18 }}>
        <Fila label="Estado" value={upcoming.remainingLabel} destacado={upcoming.status === "vencido"} />
        <Fila label="Regla" value={upcoming.ruleLabel} />
        <Fila label="Último trabajo" value={`${formatDate(upcoming.since.date)} · ${km(upcoming.since.odometer)} km`} />
        <Fila label="Cliente" value={client?.name ?? vehicle.ownerName} />
        <Fila label="Teléfono" value={client?.phone ?? "—"} />
      </div>

      <div style={microLabel}>Acciones</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {client && (
          <>
            <a className="cf-tap" href={`tel:${phoneDigits}`} style={accion}>
              Llamar a {client.name}
            </a>
            <a
              className="cf-tap"
              href={`https://wa.me/${phoneDigits}?text=${mensaje}`}
              target="_blank"
              rel="noreferrer"
              style={accion}
            >
              Enviar recordatorio por WhatsApp
            </a>
          </>
        )}
        <button className="cf-tap" onClick={() => onIrAFicha(`/vehiculos/${vehicle.id}`)} style={{ ...accion, textAlign: "left" }}>
          Ver ficha del vehículo
        </button>
        <button
          className="cf-btn"
          onClick={() => onIrAFicha(`/trabajos?vehiculo=${vehicle.id}`)}
          style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, textAlign: "left" }}
        >
          Registrar el trabajo
        </button>
      </div>
    </div>
  );
}

const accion: React.CSSProperties = {
  display: "block",
  padding: "10px 14px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 500,
  border: "1px solid var(--cf-border)",
  background: "var(--cf-bg)",
  color: "var(--cf-text)",
  width: "100%",
  fontFamily: "inherit",
};

function Fila({ label, value, destacado }: { label: string; value: string; destacado?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "var(--cf-dim)", flexShrink: 0 }}>{label}</span>
      <span
        className="cf-mono"
        style={{ textAlign: "right", fontSize: 11.5, color: destacado ? "var(--cf-danger)" : "var(--cf-text)" }}
      >
        {value}
      </span>
    </div>
  );
}
