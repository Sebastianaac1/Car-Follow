export type VehicleKind = "auto" | "moto" | "camion" | "maquinaria";

export type MaintenanceStatus = "ok" | "pronto" | "vencido";

/** Autor de un registro o modificación: la persona dueña o un taller. */
export type AuthorRole = "persona" | "taller";

export interface Author {
  role: AuthorRole;
  name: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  kind: VehicleKind;
  odometer: number;
  ownerId: string;
  ownerName: string;
  status: MaintenanceStatus;
}

/** Regla de recordatorio por pieza: salta por km o por tiempo, lo que ocurra primero. */
export interface PartRule {
  id: string;
  part: string;
  intervalKm: number | null;
  intervalMonths: number | null;
}

/** Próxima mantención estimada para un vehículo, derivada de una regla. */
export interface UpcomingService {
  id: string;
  vehicleId: string;
  part: string;
  status: MaintenanceStatus;
  /** Progreso del intervalo consumido, 0..1. */
  progress: number;
  remainingLabel: string;
  ruleLabel: string;
}

/** Una entrada del historial de mantención de un vehículo. */
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  title: string;
  date: string;
  odometer: number;
  place: "taller" | "particular";
  parts: string[];
  author: Author;
  /** Audit trail: cada modificación queda firmada, nada se sobrescribe en silencio. */
  revisions: Revision[];
  nextRule?: {
    intervalKm: number | null;
    intervalMonths: number | null;
  };
}

export interface Revision {
  id: string;
  description: string;
  timestamp: string;
  author: Author;
}

export type AlertLevel = "vencido" | "pronto" | "info";

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  vehicleName: string;
  body: string;
  meta?: string;
  actions?: { label: string; primary?: boolean }[];
}

export interface Client {
  id: string;
  name: string;
  vehicleIds: string[];
  plan: "particular";
}
