import { useState } from "react";
import { vehicles } from "@cf/mock-data";
import { DetailBody } from "./DetailBody";

export function Historial() {
  const mine = vehicles.filter((v) => v.ownerId === "martin");
  const [selected, setSelected] = useState(mine[0].id);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 7, padding: "14px 20px 4px", flexWrap: "wrap" }}>
        {mine.map((v) => {
          const on = v.id === selected;
          return (
            <span
              key={v.id}
              onClick={() => setSelected(v.id)}
              style={{
                padding: "7px 12px",
                borderRadius: 10,
                fontSize: 12.5,
                cursor: "pointer",
                border: `1px solid ${on ? "var(--cf-accent)" : "var(--cf-border)"}`,
                background: on ? "var(--cf-accent-soft)" : "var(--cf-surface)",
                color: on ? "var(--cf-accent)" : "var(--cf-dim)",
                fontWeight: on ? 600 : 400,
              }}
            >
              {v.name}
            </span>
          );
        })}
      </div>
      <DetailBody vehicleId={selected} />
    </div>
  );
}
