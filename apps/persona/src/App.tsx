import { Route, Routes } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import { DataProvider } from "./store";
import { PhoneFrame } from "./PhoneFrame";
import { Garaje } from "./screens/Garaje";
import { Historial } from "./screens/Historial";
import { VehicleDetail } from "./screens/VehicleDetail";
import { Registrar } from "./screens/Registrar";
import { Alertas } from "./screens/Alertas";
import { Perfil } from "./screens/Perfil";
import { Reglas } from "./screens/Reglas";

export function App() {
  return (
    <DataProvider>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--cf-bg)",
          color: "var(--cf-text)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 16px 56px",
          gap: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={40} radius={12} font={17} />
            <div>
              <div className="cf-display" style={{ fontWeight: 700, fontSize: 18, lineHeight: 1 }}>
                Car Follow
              </div>
              <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-accent)", marginTop: 4 }}>
                App de la persona
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <PhoneFrame showTabs={useTabsForRoute()}>
          <Routes>
            <Route path="/" element={<Garaje />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/vehiculo/:id" element={<VehicleDetail />} />
            <Route path="/registrar" element={<Registrar />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/perfil/reglas" element={<Reglas />} />
          </Routes>
        </PhoneFrame>
      </div>
    </DataProvider>
  );
}

import { useLocation } from "react-router-dom";
function useTabsForRoute() {
  const { pathname } = useLocation();
  return pathname !== "/registrar";
}
