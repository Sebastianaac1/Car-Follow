import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PiBell, PiClockCounterClockwise, PiGarage, PiUser } from "react-icons/pi";
import { Logo, ThemeToggle } from "@cf/ui";
import { useSesion } from "./sesion";

const secciones = [
  { key: "garaje", label: "Garaje", path: "/", Icono: PiGarage },
  { key: "historial", label: "Historial", path: "/historial", Icono: PiClockCounterClockwise },
  { key: "alertas", label: "Alertas", path: "/alertas", Icono: PiBell },
  { key: "perfil", label: "Perfil", path: "/perfil", Icono: PiUser },
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

  const botones = secciones.map(({ key, label, path, Icono }) => (
    <button key={key} onClick={() => navigate(path)} aria-current={actual === key ? "page" : undefined}>
      <Icono aria-hidden />
      {label}
    </button>
  ));

  return (
    <div className="cf-app">
      <header className="cf-barra">
        <div className="cf-columna">
          <div className="cf-barra-marca">
            <Logo size={32} />
            <span className="cf-display" style={{ fontSize: 22, fontWeight: 700 }}>
              Car Follow
            </span>
          </div>

          <nav className="cf-barra-nav" aria-label="Secciones">
            {botones}
          </nav>

          <div className="cf-barra-fin">
            {sesion && (
              <span className="cf-barra-usuario" style={{ fontSize: 14, color: "var(--cf-dim)", whiteSpace: "nowrap" }}>
                {sesion.nombre}
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="cf-contenido cf-columna">{children}</main>

      <nav className="cf-tabs" aria-label="Secciones">
        {botones}
      </nav>
    </div>
  );
}
