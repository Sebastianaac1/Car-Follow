export type VehicleKind = "auto" | "moto" | "camion" | "maquinaria";

export type MaintenanceStatus = "ok" | "pronto" | "vencido";

/** Autor de un registro o modificación: la persona dueña o un taller. */
export type AuthorRole = "persona" | "taller";

export interface Author {
  role: AuthorRole;
  name: string;
}

/**
 * Cuenta de acceso. El rol es un dato de la cuenta, no una opción del formulario:
 * al entrar se descubre buscando el correo, nunca se le pregunta al cliente.
 */
export interface Account {
  email: string;
  role: AuthorRole;
  name: string;
  /** Solo en cuentas de persona: de quién son los vehículos que verá. */
  ownerId?: string;
}

/** El estado no se guarda: se deriva de las mantenciones registradas. */
export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  kind: VehicleKind;
  odometer: number;
  ownerId: string;
  ownerName: string;
}

/** Regla de recordatorio por pieza: salta por km o por tiempo, lo que ocurra primero. */
export interface PartRule {
  id: string;
  part: string;
  intervalKm: number | null;
  intervalMonths: number | null;
  /** Términos que se buscan en el título y las piezas de un trabajo para saber si lo cubre. */
  keywords: string[];
}

/** Próxima mantención de una pieza, derivada del último trabajo que la cubrió. */
export interface UpcomingService {
  id: string;
  vehicleId: string;
  part: string;
  status: MaintenanceStatus;
  /** Fracción del intervalo consumida. Pasa de 1 cuando está vencida. */
  progress: number;
  remainingLabel: string;
  ruleLabel: string;
  /** Trabajo desde el que se cuenta el intervalo. Cada app lo formatea a su manera. */
  since: { date: string; odometer: number };
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

export interface Client {
  id: string;
  name: string;
  phone: string;
  vehicleIds: string[];
}
