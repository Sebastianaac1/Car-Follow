import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SesionProvider, useSesion } from "./sesion";
import { Layout } from "./Layout";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Dashboard } from "./pages/Dashboard";
import { Clientes } from "./pages/Clientes";
import { Vehiculos } from "./pages/Vehiculos";
import { VehiculoDetalle } from "./pages/VehiculoDetalle";
import { Trabajos } from "./pages/Trabajos";
import { Recordatorios } from "./pages/Recordatorios";
import { Ajustes } from "./pages/Ajustes";

export function App() {
  return (
    <SesionProvider>
      <Rutas />
    </SesionProvider>
  );
}

function Rutas() {
  const { sesion } = useSesion();
  const { pathname, search } = useLocation();

  if (!sesion) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        {/* Guarda de ruta: sin sesión no se monta ninguna pantalla del panel, y
            se recuerda a dónde iba para volver ahí después de entrar. */}
        <Route path="*" element={<Navigate to="/login" replace state={{ desde: pathname + search }} />} />
      </Routes>
    );
  }

  // Ya no hay DataProvider: cada pantalla pide lo suyo con useApi, así que lo que se ve
  // es siempre lo que se acaba de traer y no una copia en memoria que hay que sincronizar.
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/registro" element={<Navigate to="/" replace />} />
      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/vehiculos" element={<Vehiculos />} />
              <Route path="/vehiculos/:id" element={<VehiculoDetalle />} />
              <Route path="/trabajos" element={<Trabajos />} />
              <Route path="/recordatorios" element={<Recordatorios />} />
              <Route path="/ajustes" element={<Ajustes />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}
