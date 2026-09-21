import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import { useSesion } from "./sesion";

/** Trazos de los iconos de navegación (viewBox 24, stroke currentColor). */
const secciones = [
  { key: "garaje", label: "Garaje", path: "/", icon: "M5 17h14M4 17v-4l2-5h12l2 5v4M7 17v2M17 17v2M7.5 13h1M15.5 13h1" },
  { key: "historial", label: "Historial", path: "/historial", icon: "M12 7v5l3 2M3.4 9a9 9 0 1 0 2.2-3.6L3 8m0 0V4m0 4h4" },
  { key: "alertas", label: "Alertas", path: "/alertas", icon: "M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M13.7 20a1.9 1.9 0 0 1-3.4 0" },
  { key: "perfil", label: "Perfil", path: "/perfil", icon: "M16 20v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
];

function seccionActiva(pathname: string): string {
  if (pathname.startsWith("/historial")) return "historial";
  if (pathname.startsWith("/alertas")) return "alertas";
  if (pathname.startsWith("/perfil")) return "perfil";
  return "garaje";
}

/**
 * El marco de la app. La misma lista de secciones se pinta dos veces —arriba en ancho y
 * abajo en angosto— porque son dos formas distintas: la de arriba es horizontal con el
 * texto al lado del icono, la de abajo es vertical y fija al borde de la ventana. El CSS
 * decide cuál se ve; nunca están las dos a la vez.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { sesion } = useSesion();
  const actual = seccionActiva(pathname);

  return (
    <div className="cf-app">
      <header className="cf-barra">
        <div className="cf-barra-marca">
          <Logo size={32} radius={10} font={13} />
          <span className="cf-display cf-barra-titulo" style={{ fontWeight: 700, fontSize: 15 }}>
            Car Follow
          </span>
        </div>

        <nav className="cf-barra-nav">
          {secciones.map((s) => {
            const on = actual === s.key;
            return (
              <button
                key={s.key}
                onClick={() => navigate(s.path)}
                aria-current={on ? "page" : undefined}
                className="cf-tap"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 13px",
                  border: "none",
                  borderRadius: 10,
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: on ? 600 : 500,
                  background: on ? "var(--cf-accent-soft)" : "transparent",
                  color: on ? "var(--cf-accent)" : "var(--cf-dim)",
                  cursor: "pointer",
                }}
              >
                <Icono d={s.icon} />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="cf-barra-fin">
          {sesion && (
            <span style={{ fontSize: 12.5, color: "var(--cf-dim)", whiteSpace: "nowrap" }}>{sesion.nombre}</span>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="cf-contenido">{children}</main>

      <nav className="cf-tabs">
        {secciones.map((s) => {
          const on = actual === s.key;
          return (
            <button
              key={s.key}
              onClick={() => navigate(s.path)}
              aria-current={on ? "page" : undefined}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "5px 12px",
                border: "none",
                borderRadius: 10,
                fontFamily: "inherit",
                background: on ? "var(--cf-accent-soft)" : "transparent",
                color: on ? "var(--cf-accent)" : "var(--cf-dim)",
                fontSize: 10,
                fontWeight: on ? 600 : 500,
                cursor: "pointer",
              }}
            >
              <Icono d={s.icon} />
              {s.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Icono({ d }: { d: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
