import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SesionProvider, useSesion } from "./sesion";
import { Layout } from "./Layout";
import { Login } from "./screens/Login";
import { Registro } from "./screens/Registro";
import { Garaje } from "./screens/Garaje";
import { Historial } from "./screens/Historial";
import { VehicleDetail } from "./screens/VehicleDetail";
import { NuevoVehiculo } from "./screens/NuevoVehiculo";
import { Registrar } from "./screens/Registrar";
import { Alertas } from "./screens/Alertas";
import { Perfil } from "./screens/Perfil";
import { Reglas } from "./screens/Reglas";

export function App() {
  return (
    <SesionProvider>
      <Pantallas />
    </SesionProvider>
  );
}

function Pantallas() {
  const { sesion } = useSesion();
  const { pathname, search } = useLocation();

  // Login y registro van sin el marco de la app: sin sesión no hay ninguna sección a la
  // que navegar, así que una barra de navegación ahí sería decorado muerto.
  if (!sesion) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        {/* Guarda de ruta: sin sesión no se monta ninguna pantalla de la app, y
            se recuerda a dónde iba para volver ahí después de entrar. */}
        <Route path="*" element={<Navigate to="/login" replace state={{ desde: pathname + search }} />} />
      </Routes>
    );
  }

  // Ya no hay DataProvider: cada pantalla pide lo suyo con useApi, así que lo que se ve
  // es siempre lo que se acaba de traer y no una copia en memoria que hay que sincronizar.
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/registro" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Garaje />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/nuevo-vehiculo" element={<NuevoVehiculo />} />
        <Route path="/vehiculo/:id" element={<VehicleDetail />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/reglas" element={<Reglas />} />
      </Routes>
    </Layout>
  );
}
