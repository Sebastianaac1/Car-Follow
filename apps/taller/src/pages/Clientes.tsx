import { clients, vehicleById } from "@cf/mock-data";

export function Clientes() {
  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Clientes
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        {clients.length} clientes con vehículos en seguimiento
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {clients.map((c) => (
          <div key={c.id} style={{ border: "1px solid var(--cf-border)", borderRadius: 14, background: "var(--cf-bg)", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "var(--cf-persona-soft)",
                  color: "var(--cf-persona)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                {c.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-dim)" }}>
                  {c.vehicleIds.length} vehículo{c.vehicleIds.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {c.vehicleIds.map((id) => {
                const v = vehicleById(id);
                return (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span>{v?.name}</span>
                    <span className="cf-mono" style={{ color: "var(--cf-dim)" }}>
                      {v?.plate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
