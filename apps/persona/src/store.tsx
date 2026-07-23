import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { MaintenanceRecord, PartRule } from "@cf/types";
import {
  maintenanceRecords as seedRecords,
  partRules as seedRules,
} from "@cf/mock-data";

interface NewRecordInput {
  vehicleId: string;
  title: string;
  date: string;
  odometer: number;
  place: "taller" | "particular";
  parts: string[];
  nextRule?: { intervalKm: number | null; intervalMonths: number | null };
}

interface DataContextValue {
  records: MaintenanceRecord[];
  rules: PartRule[];
  recordsByVehicle: (vehicleId: string) => MaintenanceRecord[];
  addRecord: (input: NewRecordInput) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<MaintenanceRecord[]>(seedRecords);
  const [rules] = useState<PartRule[]>(seedRules);

  const value = useMemo<DataContextValue>(
    () => ({
      records,
      rules,
      recordsByVehicle: (vehicleId) => records.filter((r) => r.vehicleId === vehicleId),
      addRecord: (input) => {
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
          place: input.place,
          parts: input.parts,
          author: { role: "persona", name: "Registrado por ti" },
          nextRule: input.nextRule,
          revisions: [
            {
              id: `rev-${Date.now()}`,
              description: "Registró el trabajo",
              timestamp: stamp,
              author: { role: "persona", name: "Martín (dueño)" },
            },
          ],
        };
        setRecords((prev) => [record, ...prev]);
      },
    }),
    [records, rules],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de DataProvider");
  return ctx;
}
