import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiCar, PiCheckCircle, PiClock, PiPhone, PiPlus, PiWarning, PiWhatsappLogo } from "react-icons/pi";
import { Patente, StatusBadge } from "@cf/ui";
import type { Client, UpcomingService, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { useSesion } from "../sesion";
import { formatDate, km } from "../format";

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
      <h1 className="cf-display" style={{ fontSize: 40, margin: 0 }}>
        Recordatorios
      </h1>
      <p className="cf-num" style={{ color: "var(--cf-dim)", margin: "6px 0 24px" }}>
        {lista.length} {lista.length === 1 ? "pendiente" : "pendientes"}. Se generan solos con cada trabajo registrado,
        por km o por tiempo, lo que ocurra primero.
      </p>

      {lista.length === 0 ? (
        <div className="cf-panel" style={{ display: "flex", gap: 12, alignItems: "center", padding: 20, maxWidth: 560 }}>
          <PiCheckCircle aria-hidden size={26} color="var(--cf-ok)" />
          Ningún vehículo de la cartera tiene mantenciones pendientes.
        </div>
      ) : (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="cf-panel cf-lista" style={{ flex: "1.3 1 380px", minWidth: 0, overflow: "hidden" }}>
            {lista.map((u) => {
              const v = vehiculos.find((x) => x.id === u.vehicleId);
              const active = selected?.id === u.id;
              const Icono = u.status === "vencido" ? PiWarning : PiClock;
              return (
                <button
                  key={u.id}
                  className="cf-tap"
                  onClick={() => setSelectedId(u.id)}
                  aria-pressed={active}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    width: "100%",
                    padding: "14px 16px",
                    border: "none",
                    boxShadow: active ? "inset 3px 0 0 var(--cf-accent)" : "none",
                    background: active ? "var(--cf-accent-soft)" : "transparent",
                    font: "inherit",
                    color: "inherit",
                    textAlign: "left",
                  }}
                >
                  <Icono aria-hidden size={22} color={u.status === "vencido" ? "var(--cf-danger)" : "var(--cf-warn)"} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>
                      {u.part} de {v?.name ?? "un vehículo"}
                    </span>
                    <span className="cf-num" style={{ display: "block", fontSize: 14, color: "var(--cf-dim)" }}>
                      {v?.ownerName ?? "Cliente sin nombre"}, {u.remainingLabel}
                    </span>
                  </span>
                  <StatusBadge status={u.status} />
                </button>
              );
            })}
          </div>

          <div style={{ flex: "1 1 320px", minWidth: 0, position: "sticky", top: 24 }}>
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
      )}
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
  const nombre = cliente?.name ?? vehicle.ownerName;

  // El nombre del taller sale de la sesión, no de una constante: el mensaje lo firma
  // quien está usando el panel.
  const mensaje = encodeURIComponent(
    `Hola ${nombre}, le escribimos de ${taller} por su ${vehicle.name} (${vehicle.plate}): ` +
      `${upcoming.part.toLowerCase()} ${upcoming.status === "vencido" ? "está" : "vence en"} ${upcoming.remainingLabel}. ` +
      `¿Le agendamos una hora?`,
  );

  return (
    <div className="cf-panel" style={{ padding: 20 }}>
      <Patente valor={vehicle.plate} alto={28} />
      <div className="cf-display" style={{ fontSize: 28, margin: "12px 0 2px" }}>
        {upcoming.part}
      </div>
      <div className="cf-num" style={{ color: "var(--cf-dim)", marginBottom: 16 }}>
        {vehicle.name}, {km(vehicle.odometer)} km
      </div>

      <dl className="cf-num" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: "0 0 20px", fontSize: 14.5 }}>
        <dt style={{ color: "var(--cf-dim)" }}>Estado</dt>
        <dd style={{ margin: 0, textAlign: "right", fontWeight: 600, color: upcoming.status === "vencido" ? "var(--cf-danger)" : "var(--cf-warn)" }}>
          {upcoming.remainingLabel}
        </dd>
        <dt style={{ color: "var(--cf-dim)" }}>Regla</dt>
        <dd style={{ margin: 0, textAlign: "right" }}>{upcoming.ruleLabel}</dd>
        <dt style={{ color: "var(--cf-dim)" }}>Último trabajo</dt>
        <dd style={{ margin: 0, textAlign: "right" }}>
          {formatDate(upcoming.since.date)}, {km(upcoming.since.odometer)} km
        </dd>
        <dt style={{ color: "var(--cf-dim)" }}>Cliente</dt>
        <dd style={{ margin: 0, textAlign: "right" }}>{nombre}</dd>
        <dt style={{ color: "var(--cf-dim)" }}>Teléfono</dt>
        <dd style={{ margin: 0, textAlign: "right" }}>{cliente?.phone || "Sin teléfono"}</dd>
      </dl>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {telefono && (
          <>
            <a className="cf-btn-quieto" href={`https://wa.me/${telefono}?text=${mensaje}`} target="_blank" rel="noreferrer" style={{ justifyContent: "flex-start" }}>
              <PiWhatsappLogo aria-hidden />
              Enviar recordatorio por WhatsApp
            </a>
            <a className="cf-btn-quieto" href={`tel:${telefono}`} style={{ justifyContent: "flex-start" }}>
              <PiPhone aria-hidden />
              Llamar a {nombre}
            </a>
          </>
        )}
        <button className="cf-btn-quieto" onClick={() => onIr(`/vehiculos/${vehicle.id}`)} style={{ justifyContent: "flex-start" }}>
          <PiCar aria-hidden />
          Ver ficha del vehículo
        </button>
        <button className="cf-btn" onClick={() => onIr(`/trabajos?vehiculo=${vehicle.id}`)} style={{ justifyContent: "flex-start" }}>
          <PiPlus aria-hidden />
          Registrar el trabajo
        </button>
      </div>
    </div>
  );
}
