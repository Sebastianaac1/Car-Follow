import { Fragment, type CSSProperties } from "react";
import {
  PiBulldozer,
  PiCar,
  PiCheckBold,
  PiClockBold,
  PiMoon,
  PiMotorcycle,
  PiStamp,
  PiSun,
  PiTruck,
  PiWarningBold,
} from "react-icons/pi";
import type { IconType } from "react-icons";
import type { VehicleKind } from "@cf/types";
import { useTheme } from "./ThemeProvider";

type Status = "ok" | "pronto" | "vencido";

const statusMeta: Record<Status, { label: string; color: string; soft: string; Icono: IconType }> = {
  ok: { label: "Al día", color: "var(--cf-ok)", soft: "var(--cf-ok-soft)", Icono: PiCheckBold },
  pronto: { label: "Pronto", color: "var(--cf-warn)", soft: "var(--cf-warn-soft)", Icono: PiClockBold },
  vencido: { label: "Vencido", color: "var(--cf-danger)", soft: "var(--cf-danger-soft)", Icono: PiWarningBold },
};

/**
 * Los cuatro tipos de vehículo con su nombre y su ícono. Estaban copiados en cinco
 * pantallas entre las dos apps; el orden de la lista es el de los formularios.
 */
export const tiposDeVehiculo = {
  auto: { label: "Auto", Icono: PiCar },
  moto: { label: "Moto", Icono: PiMotorcycle },
  camion: { label: "Camión", Icono: PiTruck },
  maquinaria: { label: "Maquinaria", Icono: PiBulldozer },
} satisfies Record<VehicleKind, { label: string; Icono: IconType }>;

export const ordenDeTipos: VehicleKind[] = ["auto", "moto", "camion", "maquinaria"];

/** La marca: las iniciales en tinta de timbre, sin degradado ni resplandor. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="cf-display"
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: "var(--cf-accent)",
        color: "var(--cf-on-accent)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.5,
        letterSpacing: 0.5,
        flexShrink: 0,
      }}
    >
      CF
    </span>
  );
}

/**
 * La patente como se ve en la placa: de a pares con un punto al medio ("BB·CL·12").
 * Si no tiene los 6 caracteres de una patente chilena se muestra tal cual.
 */
export function Patente({ valor, alto = 24 }: { valor: string; alto?: number }) {
  const limpio = valor.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const pares = limpio.length === 6 ? [limpio.slice(0, 2), limpio.slice(2, 4), limpio.slice(4)] : [limpio];
  return (
    <span className="cf-patente" style={{ height: alto, fontSize: Math.round(alto * 0.7) }}>
      {pares.map((par, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="cf-patente-punto" aria-hidden />}
          {par}
        </Fragment>
      ))}
    </span>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const seg = (on: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 28,
    borderRadius: 6,
    cursor: "pointer",
    border: "none",
    fontSize: 16,
    background: on ? "var(--cf-surface)" : "transparent",
    color: on ? "var(--cf-text)" : "var(--cf-dim)",
    boxShadow: on ? "0 0 0 1px var(--cf-border)" : "none",
  });
  return (
    <div
      role="group"
      aria-label="Tema"
      style={{ display: "inline-flex", gap: 2, padding: 2, borderRadius: 8, background: "var(--cf-surface-2)" }}
    >
      <button onClick={() => setTheme("light")} style={seg(theme === "light")} aria-label="Tema claro" aria-pressed={theme === "light"}>
        <PiSun aria-hidden />
      </button>
      <button onClick={() => setTheme("dark")} style={seg(theme === "dark")} aria-label="Tema oscuro" aria-pressed={theme === "dark"}>
        <PiMoon aria-hidden />
      </button>
    </div>
  );
}

/** Estado de un vehículo o de una pieza: color, ícono y palabra, nunca solo el color. */
export function StatusBadge({ status }: { status: Status }) {
  const { label, color, soft, Icono } = statusMeta[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        borderRadius: 4,
        background: soft,
        color,
        fontSize: 13,
        fontWeight: 600,
        width: "fit-content",
        whiteSpace: "nowrap",
      }}
    >
      <Icono aria-hidden />
      {label}
    </span>
  );
}

export function ProgressBar({ value, status, height = 4 }: { value: number; status: Status; height?: number }) {
  return (
    <div style={{ height, borderRadius: 2, background: "var(--cf-surface-2)" }}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
          height: "100%",
          borderRadius: 2,
          background: statusMeta[status].color,
        }}
      />
    </div>
  );
}

/**
 * Quién firmó un registro del historial, como un timbre: azul el taller, violeta la
 * persona. El historial es un audit trail y esto es su firma.
 */
export function AuthorPill({ role, name }: { role: "persona" | "taller"; name: string }) {
  const color = role === "persona" ? "var(--cf-persona)" : "var(--cf-accent)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 7px",
        borderRadius: 4,
        border: `1px solid ${color}`,
        fontSize: 12.5,
        fontWeight: 500,
        color,
      }}
    >
      <PiStamp aria-hidden />
      {name}
    </span>
  );
}
