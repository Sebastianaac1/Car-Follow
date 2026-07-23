import { useNavigate } from "react-router-dom";
import { useData } from "../store";
import { km } from "../format";

export function Reglas() {
  const navigate = useNavigate();
  const { rules } = useData();

  return (
    <div style={{ padding: "14px 20px" }}>
      <div style={{ marginBottom: 6 }}>
        <span onClick={() => navigate("/perfil")} style={{ fontSize: 18, cursor: "pointer" }}>
          ‹
        </span>
      </div>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
        Reglas por pieza
      </div>
      <div style={{ fontSize: 12, color: "var(--cf-dim)", marginBottom: 18, lineHeight: 1.5 }}>
        Intervalos predefinidos por CF. Ajústalos según tu uso — el aviso salta por km o tiempo, lo primero.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rules.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid var(--cf-border)",
              borderRadius: 14,
              background: "var(--cf-surface)",
              padding: "12px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{r.part}</div>
              <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", marginTop: 4 }}>
                {r.intervalKm ? `${km(r.intervalKm)} km` : "—"} · {r.intervalMonths ? `${r.intervalMonths} meses` : "—"}
              </div>
            </div>
            <span style={{ color: "var(--cf-accent)", fontSize: 13, cursor: "pointer" }}>Editar</span>
          </div>
        ))}
        <div
          style={{
            border: "1px dashed var(--cf-border)",
            borderRadius: 14,
            padding: "12px 14px",
            textAlign: "center",
            color: "var(--cf-dim)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          + Añadir regla personalizada
        </div>
      </div>
    </div>
  );
}
