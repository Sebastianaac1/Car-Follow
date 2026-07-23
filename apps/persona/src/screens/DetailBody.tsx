import { AuthorPill, ProgressBar } from "@cf/ui";
import { upcomingByVehicle, vehicleById } from "@cf/mock-data";
import { useData } from "../store";
import { formatDate, km } from "../format";

const photo =
  "repeating-linear-gradient(45deg,var(--cf-surface-2),var(--cf-surface-2) 9px,transparent 9px,transparent 18px)";

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "var(--cf-dim)",
  marginBottom: 10,
};

export function DetailBody({ vehicleId, onBack }: { vehicleId: string; onBack?: () => void }) {
  const vehicle = vehicleById(vehicleId);
  const { recordsByVehicle } = useData();
  if (!vehicle) return <div style={{ padding: 20 }}>Vehículo no encontrado.</div>;

  const upcoming = upcomingByVehicle[vehicleId] ?? [];
  const records = recordsByVehicle(vehicleId);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 120,
          background: photo,
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: "14px 20px",
        }}
      >
        {onBack && (
          <span onClick={onBack} style={{ position: "absolute", top: 10, left: 16, fontSize: 22, cursor: "pointer" }}>
            ‹
          </span>
        )}
        <div>
          <div className="cf-display" style={{ fontWeight: 600, fontSize: 20 }}>
            {vehicle.name}
          </div>
          <div className="cf-mono" style={{ fontSize: 12, color: "var(--cf-dim)" }}>
            {vehicle.plate} · {km(vehicle.odometer)} km
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <div style={sectionLabel}>Próximos mantenimientos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {upcoming.map((u) => (
            <div
              key={u.id}
              style={{
                border: "1px solid var(--cf-border)",
                borderRadius: 14,
                background: "var(--cf-surface)",
                padding: "11px 13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 13.5 }}>{u.part}</span>
                <span
                  className="cf-mono"
                  style={{
                    fontSize: 11,
                    color: u.status === "ok" ? "var(--cf-ok)" : u.status === "pronto" ? "var(--cf-warn)" : "var(--cf-danger)",
                  }}
                >
                  {u.remainingLabel}
                </span>
              </div>
              <ProgressBar value={u.progress} status={u.status} height={5} />
              <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-dim)", marginTop: 6 }}>
                {u.ruleLabel}
              </div>
            </div>
          ))}
          {upcoming.length === 0 && (
            <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)" }}>
              Sin próximos mantenimientos programados.
            </div>
          )}
        </div>

        <div style={sectionLabel}>Historial</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {records.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                gap: 11,
                paddingBottom: i === records.length - 1 ? 0 : 14,
                borderLeft: "2px solid var(--cf-border)",
                marginLeft: 5,
                paddingLeft: 16,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: -6,
                  top: 2,
                  width: 10,
                  height: 10,
                  borderRadius: 99,
                  background: r.author.role === "taller" ? "var(--cf-accent)" : "var(--cf-persona)",
                  border: "2px solid var(--cf-bg)",
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</div>
                <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)", marginTop: 3 }}>
                  {formatDate(r.date)} · {km(r.odometer)} km
                </div>
                <div style={{ marginTop: 7 }}>
                  <AuthorPill role={r.author.role} name={r.author.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
