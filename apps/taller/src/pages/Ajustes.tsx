import { PiSignOut } from "react-icons/pi";
import { ThemeToggle } from "@cf/ui";
import type { Client, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { useSesion } from "../sesion";

const seccion: React.CSSProperties = { padding: "18px 20px" };
const subtitulo: React.CSSProperties = { fontSize: 22, margin: "0 0 12px" };

export function Ajustes() {
  const { sesion, salir } = useSesion();
  const flota = useApi<Vehicle[]>("/taller/vehiculos");
  const cartera = useApi<Client[]>("/taller/clientes");

  if (flota.cargando || cartera.cargando) return <Cargando que="los datos del taller" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (cartera.error) return <ErrorApi mensaje={cartera.error} onReintentar={cartera.recargar} />;

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="cf-display" style={{ fontSize: 40, margin: "0 0 24px" }}>
        Ajustes
      </h1>

      <div className="cf-panel cf-lista">
        <section style={seccion}>
          <h2 className="cf-display" style={subtitulo}>
            Taller
          </h2>
          <dl className="cf-num" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: 0 }}>
            <dt style={{ color: "var(--cf-dim)" }}>Nombre</dt>
            <dd style={{ margin: 0, textAlign: "right" }}>{sesion?.nombre ?? "Sin nombre"}</dd>
            <dt style={{ color: "var(--cf-dim)" }}>Clientes</dt>
            <dd style={{ margin: 0, textAlign: "right" }}>{(cartera.datos ?? []).length}</dd>
            <dt style={{ color: "var(--cf-dim)" }}>Vehículos en seguimiento</dt>
            <dd style={{ margin: 0, textAlign: "right" }}>{(flota.datos ?? []).length}</dd>
          </dl>
        </section>

        {/* Acá había una tarjeta de "Plan · Facturación mensual · Activo" con datos del
            taller de ejemplo. Se fue: no hay facturación en ninguna parte del sistema y
            mostrarla era inventar una funcionalidad que no existe. */}
        <section style={seccion}>
          <h2 className="cf-display" style={subtitulo}>
            Apariencia
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ color: "var(--cf-dim)" }}>Tema claro u oscuro del panel</span>
            <ThemeToggle />
          </div>
        </section>

        <section style={seccion}>
          <h2 className="cf-display" style={subtitulo}>
            Cuenta
          </h2>
          <div style={{ wordBreak: "break-all", marginBottom: 6 }}>{sesion?.email}</div>
          <p style={{ fontSize: 14, color: "var(--cf-dim)", margin: "0 0 16px" }}>
            Esta es la cuenta del dueño del taller. Por ahora no se pueden sumar empleados con acceso propio: cada
            cuenta de taller nueva crea un taller aparte, con su propia cartera.
          </p>
          <button className="cf-btn-quieto" onClick={salir} style={{ color: "var(--cf-danger)" }}>
            <PiSignOut aria-hidden />
            Cerrar sesión
          </button>
        </section>
      </div>
    </div>
  );
}
