import { StatusBadge } from "@cf/ui";
import { vehicleById, workshopRows } from "@cf/mock-data";

const order = { vencido: 0, pronto: 1, ok: 2 } as const;

export function Recordatorios() {
  const rows = [...workshopRows]
    .map((r) => ({ ...r, vehicle: vehicleById(r.vehicleId)! }))
    .sort((a, b) => order[a.vehicle.status] - order[b.vehicle.status]);

  return (
    <>
      <div className="cf-display" style={{ fontWeight: 600, fontSize: 24, marginBottom: 4 }}>
        Recordatorios
      </div>
      <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginBottom: 22 }}>
        Próximos mantenimientos por km o tiempo — lo que ocurra primero.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => (
          <div
            key={r.vehicleId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              border: "1px solid var(--cf-border)",
              borderRadius: 12,
              background: "var(--cf-bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 99,
                  background:
                    r.vehicle.status === "vencido"
                      ? "var(--cf-danger)"
                      : r.vehicle.status === "pronto"
                      ? "var(--cf-warn)"
                      : "var(--cf-ok)",
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.vehicle.name}</div>
                <div className="cf-mono" style={{ fontSize: 11, color: "var(--cf-dim)", marginTop: 2 }}>
                  {r.vehicle.ownerName} · {r.next}
                </div>
              </div>
            </div>
            <StatusBadge status={r.vehicle.status} />
          </div>
        ))}
      </div>
    </>
  );
}
