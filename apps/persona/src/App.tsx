import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import { SesionProvider, useSesion } from "./sesion";
import { PhoneFrame } from "./PhoneFrame";
import { Presentacion } from "./Presentacion";
import { Login } from "./screens/Login";
import { Registro } from "./screens/Registro";
import { Garaje } from "./screens/Garaje";
import { Historial } from "./screens/Historial";
import { VehicleDetail } from "./screens/VehicleDetail";
import { Registrar } from "./screens/Registrar";
import { Alertas } from "./screens/Alertas";
import { Perfil } from "./screens/Perfil";
import { Reglas } from "./screens/Reglas";

export function App() {
  return (
    <SesionProvider>
      <div className="cf-escenario">
        <div className="cf-escenario-barra">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Logo size={34} radius={10} font={14} />
            <div className="cf-display" style={{ fontWeight: 700, fontSize: 16 }}>
              Car Follow
            </div>
          </div>
          <ThemeToggle />
        </div>

        <Presentacion />
        <Pantallas />
      </div>
    </SesionProvider>
  );
}

function Pantallas() {
  const { sesion } = useSesion();
  const { pathname, search } = useLocation();

  if (!sesion) {
    return (
      <PhoneFrame showTabs={false}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          {/* Guarda de ruta: sin sesión no se monta ninguna pantalla de la app, y
              se recuerda a dónde iba para volver ahí después de entrar. */}
          <Route path="*" element={<Navigate to="/login" replace state={{ desde: pathname + search }} />} />
        </Routes>
      </PhoneFrame>
    );
  }

  // Ya no hay DataProvider: cada pantalla pide lo suyo con useApi, así que lo que se ve
  // es siempre lo que se acaba de traer y no una copia en memoria que hay que sincronizar.
  return (
    <PhoneFrame showTabs={pathname !== "/registrar"}>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/registro" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Garaje />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/vehiculo/:id" element={<VehicleDetail />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/reglas" element={<Reglas />} />
      </Routes>
    </PhoneFrame>
  );
}
