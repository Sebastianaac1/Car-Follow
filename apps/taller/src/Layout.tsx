import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import { PiBellRinging, PiCar, PiGauge, PiGear, PiSignOut, PiUsers, PiWrench } from "react-icons/pi";
import { Logo } from "@cf/ui";
import { useSesion } from "./sesion";

const nav: { label: string; path: string; Icono: IconType }[] = [
  { label: "Resumen", path: "/", Icono: PiGauge },
  { label: "Clientes", path: "/clientes", Icono: PiUsers },
  { label: "Vehículos", path: "/vehiculos", Icono: PiCar },
  { label: "Trabajos", path: "/trabajos", Icono: PiWrench },
  { label: "Recordatorios", path: "/recordatorios", Icono: PiBellRinging },
];

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sesion, salir } = useSesion();

  // El resumen vive en "/", así que solo él compara por igualdad: el resto tiene que
  // seguir activo en sus subrutas (/vehiculos/:id).
  const item = ({ label, path, Icono }: { label: string; path: string; Icono: IconType }) => {
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return (
      <button key={path} className="cf-rail-item" onClick={() => navigate(path)} aria-current={active ? "page" : undefined}>
        <Icono aria-hidden />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="cf-taller">
      <aside className="cf-rail">
        <div className="cf-rail-marca">
          <Logo size={34} />
          {/* Acá decía el plan ("Pro"), que salía del taller de ejemplo. La columna
              Workshop.plan existe y arranca en "gratis", pero no hay facturación
              detrás ni endpoint que la devuelva: mostrar un plan sería inventarlo. */}
          <div className="cf-rail-marca-texto" style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sesion?.nombre}
            </div>
            <div style={{ fontSize: 13, color: "var(--cf-rail-dim)" }}>Panel del taller</div>
          </div>
        </div>

        <nav className="cf-rail-nav" aria-label="Secciones">
          {nav.map(item)}
        </nav>

        <div className="cf-rail-pie">
          <div className="cf-rail-correo">{sesion?.email}</div>
          {item({ label: "Ajustes", path: "/ajustes", Icono: PiGear })}
          <button className="cf-rail-item" onClick={salir}>
            <PiSignOut aria-hidden />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="cf-taller-main">
        <div className="cf-taller-columna">{children}</div>
      </main>
    </div>
  );
}
