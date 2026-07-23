import { Route, Routes } from "react-router-dom";
import { DataProvider } from "./store";
import { Layout } from "./Layout";
import { Dashboard } from "./pages/Dashboard";
import { Clientes } from "./pages/Clientes";
import { Vehiculos } from "./pages/Vehiculos";
import { Trabajos } from "./pages/Trabajos";
import { Recordatorios } from "./pages/Recordatorios";
import { Ajustes } from "./pages/Ajustes";

export function App() {
  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/trabajos" element={<Trabajos />} />
          <Route path="/recordatorios" element={<Recordatorios />} />
          <Route path="/ajustes" element={<Ajustes />} />
        </Routes>
      </Layout>
    </DataProvider>
  );
}
