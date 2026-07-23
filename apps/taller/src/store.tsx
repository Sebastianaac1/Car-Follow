import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { MaintenanceRecord } from "@cf/types";
import { maintenanceRecords as seedRecords, workshop } from "@cf/mock-data";

interface NewJobInput {
  vehicleId: string;
  title: string;
  date: string;
  odometer: number;
  parts: string[];
}

interface DataContextValue {
  records: MaintenanceRecord[];
  recordsByVehicle: (vehicleId: string) => MaintenanceRecord[];
  addJob: (input: NewJobInput) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<MaintenanceRecord[]>(seedRecords);

  const value = useMemo<DataContextValue>(
    () => ({
      records,
      recordsByVehicle: (vehicleId) => records.filter((r) => r.vehicleId === vehicleId),
      addJob: (input) => {
        const now = new Date();
        const stamp = `${String(now.getDate()).padStart(2, "0")}/${String(
          now.getMonth() + 1,
        ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes(),
        ).padStart(2, "0")}`;
        const record: MaintenanceRecord = {
          id: `m-${Date.now()}`,
          vehicleId: input.vehicleId,
          title: input.title,
          date: input.date,
          odometer: input.odometer,
          place: "taller",
          parts: input.parts,
          author: { role: "taller", name: workshop.name },
          revisions: [
            {
              id: `rev-${Date.now()}`,
              description: "Registró el trabajo",
              timestamp: stamp,
              author: { role: "taller", name: workshop.name },
            },
          ],
        };
        setRecords((prev) => [record, ...prev]);
      },
    }),
    [records],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de DataProvider");
  return ctx;
}
