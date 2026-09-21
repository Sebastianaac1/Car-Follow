import { ThemeToggle } from "@cf/ui";
import type { Client, Vehicle } from "@cf/types";
import { useApi } from "../api";
import { Cargando, ErrorApi } from "../Estado";
import { useSesion } from "../sesion";

const card: React.CSSProperties = {
  border: "1px solid var(--cf-border)",
  borderRadius: 14,
  background: "var(--cf-surface)",
  padding: 18,
};

export function Ajustes() {
  const { sesion, salir } = useSesion();
  const flota = useApi<Vehicle[]>("/taller/vehiculos");
  const cartera = useApi<Client[]>("/taller/clientes");

  if (flota.cargando || cartera.cargando) return <Cargando que="los datos del taller" />;
  if (flota.error) return <ErrorApi mensaje={flota.error} onReintentar={flota.recargar} />;
  if (cartera.error) return <ErrorApi mensaje={cartera.error} onReintentar={cartera.recargar} />;

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Ajustes
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        Configuración del taller y de la cuenta
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Apariencia</div>
          <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 12 }}>Modo claro u oscuro del panel</div>
          <ThemeToggle />
        </div>

        {/* Acá había una tarjeta de "Plan · Facturación mensual · Activo" con datos del
            taller de ejemplo. Se fue: no hay facturación en ninguna parte del sistema y
            mostrarla era inventar una funcionalidad que no existe. */}
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Taller</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
            <Fila label="Nombre" value={sesion?.nombre ?? "—"} />
            <Fila label="Clientes" value={String((cartera.datos ?? []).length)} />
            <Fila label="Vehículos en seguimiento" value={String((flota.datos ?? []).length)} />
          </div>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Cuenta</div>
          <div className="cf-mono" style={{ fontSize: 12, color: "var(--cf-dim)", marginBottom: 14, wordBreak: "break-all" }}>
            {sesion?.email}
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--cf-dim)", margin: "0 0 14px" }}>
            Esta cuenta es la del dueño del taller. Sumar empleados con su propio acceso todavía no existe: hoy cada
            registro de taller crea un taller nuevo, así que dos cuentas nunca comparten cartera.
          </p>
          <button
            onClick={salir}
            className="cf-tap"
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontFamily: "inherit",
              fontWeight: 500,
              border: "1px solid var(--cf-border)",
              background: "var(--cf-bg)",
              color: "var(--cf-danger)",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}

function Fila({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "var(--cf-dim)" }}>{label}</span>
      <span style={{ textAlign: "right" }}>{value}</span>
    </div>
  );
}
