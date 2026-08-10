import { useNavigate } from "react-router-dom";
import { useSesion } from "../sesion";

const row: React.CSSProperties = {
  border: "1px solid var(--cf-border)",
  borderRadius: 14,
  background: "var(--cf-surface)",
  padding: "14px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
};

export function Perfil() {
  const navigate = useNavigate();
  const { sesion, salir } = useSesion();
  return (
    <div style={{ padding: "14px 20px" }}>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 22, marginBottom: 4 }}>
        Perfil
      </div>
      <div style={{ fontSize: 12, color: "var(--cf-dim)", marginBottom: 18 }}>Martín R. · plan gratuito</div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: "var(--cf-persona-soft)",
            border: "1px solid var(--cf-persona)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cf-persona)",
            fontWeight: 600,
            fontSize: 20,
          }}
        >
          M
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{sesion?.nombre ?? "Martín R."}</div>
          <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", wordBreak: "break-all" }}>
            {sesion?.email}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={row} onClick={() => navigate("/perfil/reglas")}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Reglas por pieza</div>
            <div style={{ fontSize: 11.5, color: "var(--cf-dim)", marginTop: 3 }}>
              Intervalos de recordatorio por km o tiempo
            </div>
          </div>
          <span style={{ color: "var(--cf-accent)", fontSize: 18 }}>›</span>
        </div>
        <div style={row}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Talleres vinculados</div>
            <div style={{ fontSize: 11.5, color: "var(--cf-dim)", marginTop: 3 }}>Taller CF Norte</div>
          </div>
          <span style={{ color: "var(--cf-accent)", fontSize: 18 }}>›</span>
        </div>
        <div style={row}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Notificaciones</div>
            <div style={{ fontSize: 11.5, color: "var(--cf-dim)", marginTop: 3 }}>Push y correo</div>
          </div>
          <span style={{ color: "var(--cf-accent)", fontSize: 18 }}>›</span>
        </div>

        <button
          onClick={salir}
          className="cf-tap"
          style={{
            ...row,
            width: "100%",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--cf-danger)",
            marginTop: 4,
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
