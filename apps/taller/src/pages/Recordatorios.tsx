import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@cf/ui";
import type { Client, UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { useSesion } from "../sesion";
import { formatDate, km } from "../format";

// Pasa las 200 líneas a propósito: la lista y el panel de acciones del recordatorio
// elegido son las dos mitades de una misma pantalla maestro-detalle.

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
  const { sesion } = useSesion();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // El servidor ya filtró los "ok" y ordenó por urgencia: acá no se deriva nada. Las
  // otras dos listas son para poner nombre y teléfono a cada recordatorio.
  const pendientes = useApi<UpcomingService[]>("/taller/recordatorios");
  const flota = useApi<Vehicle[]>("/taller/vehiculos");
  const cartera = useApi<Client[]>("/taller/clientes");

  if (pendientes.cargando || flota.cargando || cartera.cargando) return <Cargando que="los recordatorios" />;
  if (pendientes.error) return <ErrorApi mensaje={pendientes.error} onReintentar={pendientes.recargar} />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (cartera.error) return <ErrorApi mensaje={cartera.error} onReintentar={cartera.recargar} />;

  const lista = pendientes.datos ?? [];
  const vehiculos = flota.datos ?? [];
  const clientes = cartera.datos ?? [];

  const selected = lista.find((u) => u.id === selectedId) ?? lista[0];
  const vehiculoSel = selected && vehiculos.find((v) => v.id === selected.vehicleId);
  const clienteSel = vehiculoSel && clientes.find((c) => c.id === vehiculoSel.ownerId);

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Recordatorios
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        {lista.length} pendientes · se generan solos con cada trabajo registrado, por km o por tiempo, lo que ocurra
        primero.
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1.3 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {lista.map((u) => {
            const v = vehiculos.find((x) => x.id === u.vehicleId);
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
                  gap: 12,
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
                      {v?.name ?? "Vehículo"} · {u.part}
                    </div>
                    <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", marginTop: 2 }}>
                      {v?.ownerName ?? "—"} · {u.remainingLabel}
                    </div>
                  </div>
                </div>
                <StatusBadge status={u.status} />
              </div>
            );
          })}

          {lista.length === 0 && (
            <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--cf-dim)" }}>
              Ningún vehículo de la cartera tiene mantenciones pendientes.
            </div>
          )}
        </div>

        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          {selected && vehiculoSel && (
            <PanelAcciones
              upcoming={selected}
              vehicle={vehiculoSel}
              cliente={clienteSel}
              taller={sesion?.nombre ?? "tu taller"}
              onIr={navigate}
            />
          )}
        </div>
      </div>
    </>
  );
}

function PanelAcciones({
  upcoming,
  vehicle,
  cliente,
  taller,
  onIr,
}: {
  upcoming: UpcomingService;
  vehicle: Vehicle;
  cliente?: Client;
  taller: string;
  onIr: (to: string) => void;
}) {
  const telefono = cliente?.phone.replace(/\D/g, "") ?? "";

  // El nombre del taller sale de la sesión, no de una constante: el mensaje lo firma
  // quien está usando el panel.
  const mensaje = encodeURIComponent(
    `Hola ${cliente?.name ?? vehicle.ownerName}, le escribimos de ${taller} por su ${vehicle.name} (${vehicle.plate}): ` +
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
        <Fila label="Cliente" value={cliente?.name ?? vehicle.ownerName} />
        <Fila label="Teléfono" value={cliente?.phone || "—"} />
      </div>

      <div style={microLabel}>Acciones</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {telefono && (
          <>
            <a className="cf-tap" href={`tel:${telefono}`} style={accion}>
              Llamar a {cliente?.name ?? vehicle.ownerName}
            </a>
            <a
              className="cf-tap"
              href={`https://wa.me/${telefono}?text=${mensaje}`}
              target="_blank"
              rel="noreferrer"
              style={accion}
            >
              Enviar recordatorio por WhatsApp
            </a>
          </>
        )}
        <button className="cf-tap" onClick={() => onIr(`/vehiculos/${vehicle.id}`)} style={{ ...accion, textAlign: "left" }}>
          Ver ficha del vehículo
        </button>
        <button
          className="cf-btn"
          onClick={() => onIr(`/trabajos?vehiculo=${vehicle.id}`)}
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
