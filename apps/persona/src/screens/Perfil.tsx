import { useNavigate } from "react-router-dom";
import { PiCaretRight, PiListChecks, PiSignOut } from "react-icons/pi";
import { useSesion } from "../sesion";

const fila: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  width: "100%",
  padding: "16px 18px",
  border: "none",
  background: "none",
  font: "inherit",
  color: "inherit",
  textAlign: "left",
};

export function Perfil() {
  const navigate = useNavigate();
  const { sesion, salir } = useSesion();
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 className="cf-display" style={{ fontSize: 40, margin: "0 0 20px" }}>
        Perfil
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div
          aria-hidden
          className="cf-display"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "2px solid var(--cf-persona)",
            color: "var(--cf-persona)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {sesion?.nombre.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{sesion?.nombre}</div>
          <div style={{ fontSize: 14.5, color: "var(--cf-dim)", wordBreak: "break-all" }}>{sesion?.email}</div>
        </div>
      </div>

      <div className="cf-panel cf-lista">
        <button className="cf-tap" style={fila} onClick={() => navigate("/perfil/reglas")}>
          <PiListChecks aria-hidden size={22} color="var(--cf-accent)" />
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontWeight: 600 }}>Reglas por pieza</span>
            <span style={{ display: "block", fontSize: 14, color: "var(--cf-dim)" }}>
              Cada cuántos km o meses te avisamos
            </span>
          </span>
          <PiCaretRight aria-hidden color="var(--cf-dim)" />
        </button>
        {/* "Talleres vinculados" y "Notificaciones" se fueron: mostraban un taller fijo y
            un ajuste que no existe. Hoy la persona no tiene forma de saber qué talleres
            ven sus vehículos (historia 7.2) ni hay avisos que configurar (historia 5.4).
            Vuelven cuando haya algo real detrás. */}
        <button className="cf-tap" style={{ ...fila, color: "var(--cf-danger)", fontWeight: 600 }} onClick={salir}>
          <PiSignOut aria-hidden size={22} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
