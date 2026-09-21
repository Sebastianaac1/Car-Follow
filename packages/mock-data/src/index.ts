import type {
  Account,
  Client,
  MaintenanceRecord,
  MaintenanceStatus,
  PartRule,
  UpcomingService,
  Vehicle,
} from "@cf/types";

export const vehicles: Vehicle[] = [
  {
    id: "hilux",
    name: "Toyota Hilux",
    plate: "JKLM·42",
    kind: "auto",
    odometer: 84320,
    ownerId: "martin",
    ownerName: "Martín R.",
  },
  {
    id: "cb500",
    name: "Honda CB500",
    plate: "BDRT·19",
    kind: "moto",
    odometer: 21050,
    ownerId: "martin",
    ownerName: "Martín R.",
  },
  {
    id: "ranger",
    name: "Ford Ranger",
    plate: "PQRS·08",
    kind: "auto",
    odometer: 61200,
    ownerId: "lucia",
    ownerName: "Lucía M.",
  },
  {
    id: "scania",
    name: "Scania R450",
    plate: "HXTV·73",
    kind: "camion",
    odometer: 305400,
    ownerId: "transp-sur",
    ownerName: "Transp. Sur",
  },
  {
    id: "cat320",
    name: "Cat 320 (excav.)",
    plate: "CTRX·07",
    kind: "maquinaria",
    odometer: 12400,
    ownerId: "constr-andes",
    ownerName: "Constr. Andes",
  },
];

export const partRules: PartRule[] = [
  { id: "r-aceite", part: "Aceite motor", intervalKm: 10000, intervalMonths: 12, keywords: ["aceite"] },
  { id: "r-aire", part: "Filtro de aire", intervalKm: 15000, intervalMonths: 24, keywords: ["filtro de aire", "filtro aire"] },
  { id: "r-frenos", part: "Pastillas de freno", intervalKm: 30000, intervalMonths: 36, keywords: ["freno", "pastilla"] },
  { id: "r-correa", part: "Correa de distribución", intervalKm: 80000, intervalMonths: 60, keywords: ["correa"] },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: "m-hilux-aceite",
    vehicleId: "hilux",
    title: "Cambio de aceite + filtro",
    date: "2026-03-12",
    odometer: 82640,
    place: "taller",
    parts: ["Aceite 5W-30 ×4L", "Filtro aceite"],
    author: { role: "taller", name: "Taller CF Norte" },
    nextRule: { intervalKm: 10000, intervalMonths: 12 },
    revisions: [
      {
        id: "rev-1",
        description: "Registró el trabajo",
        timestamp: "12/03 14:02",
        author: { role: "taller", name: "Taller CF Norte" },
      },
      {
        id: "rev-2",
        description: "Corrigió km: 82.600 → 82.640",
        timestamp: "14/03 09:15",
        author: { role: "persona", name: "Martín (dueño)" },
      },
    ],
  },
  {
    id: "m-hilux-frenos",
    vehicleId: "hilux",
    title: "Pastillas de freno delanteras",
    date: "2026-01-04",
    odometer: 78900,
    place: "particular",
    parts: ["Pastillas delanteras"],
    author: { role: "persona", name: "Registrado por ti" },
    revisions: [
      {
        id: "rev-3",
        description: "Registró el trabajo",
        timestamp: "04/01 18:20",
        author: { role: "persona", name: "Martín (dueño)" },
      },
    ],
  },
  {
    id: "m-hilux-aire",
    vehicleId: "hilux",
    title: "Filtro de aire",
    date: "2025-10-15",
    odometer: 77500,
    place: "taller",
    parts: ["Filtro de aire"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-4",
        description: "Registró el trabajo",
        timestamp: "15/10 11:40",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
  {
    id: "m-cb500-aceite",
    vehicleId: "cb500",
    title: "Cambio de aceite",
    date: "2025-09-15",
    odometer: 12000,
    place: "taller",
    parts: ["Aceite 10W-40 ×2L", "Filtro aceite"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-5",
        description: "Registró el trabajo",
        timestamp: "15/09 16:05",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
  {
    id: "m-cb500-frenos",
    vehicleId: "cb500",
    title: "Pastillas de freno",
    date: "2024-11-10",
    odometer: 8200,
    place: "taller",
    parts: ["Pastillas delanteras", "Pastillas traseras"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-6",
        description: "Registró el trabajo",
        timestamp: "10/11 10:30",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
  {
    id: "m-ranger-frenos",
    vehicleId: "ranger",
    title: "Pastillas de freno + discos",
    date: "2023-02-10",
    odometer: 28000,
    place: "taller",
    parts: ["Pastillas delanteras", "Discos delanteros"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-7",
        description: "Registró el trabajo",
        timestamp: "10/02 09:00",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
  {
    id: "m-ranger-aceite",
    vehicleId: "ranger",
    title: "Cambio de aceite + filtro",
    date: "2026-05-02",
    odometer: 58400,
    place: "taller",
    parts: ["Aceite 15W-40 ×6L", "Filtro aceite"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-8",
        description: "Registró el trabajo",
        timestamp: "02/05 15:20",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
  {
    id: "m-scania-aire",
    vehicleId: "scania",
    title: "Filtro de aire",
    date: "2025-11-20",
    odometer: 291800,
    place: "taller",
    parts: ["Filtro de aire"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-9",
        description: "Registró el trabajo",
        timestamp: "20/11 08:45",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
  {
    id: "m-scania-aceite",
    vehicleId: "scania",
    title: "Cambio de aceite + filtros",
    date: "2026-06-18",
    odometer: 301200,
    place: "taller",
    parts: ["Aceite 15W-40 ×30L", "Filtro aceite"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-10",
        description: "Registró el trabajo",
        timestamp: "18/06 12:10",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
  {
    id: "m-cat320-aceite",
    vehicleId: "cat320",
    title: "Cambio de aceite motor",
    date: "2026-06-01",
    odometer: 11200,
    place: "taller",
    parts: ["Aceite 15W-40 ×20L", "Filtro aceite"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-11",
        description: "Registró el trabajo",
        timestamp: "01/06 07:30",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
  {
    id: "m-cat320-aire",
    vehicleId: "cat320",
    title: "Filtro de aire",
    date: "2025-08-12",
    odometer: 8900,
    place: "taller",
    parts: ["Filtro de aire"],
    author: { role: "taller", name: "Taller CF Norte" },
    revisions: [
      {
        id: "rev-12",
        description: "Registró el trabajo",
        timestamp: "12/08 09:55",
        author: { role: "taller", name: "Taller CF Norte" },
      },
    ],
  },
];

export const clients: Client[] = [
  { id: "martin", name: "Martín R.", phone: "+56 9 6521 4408", vehicleIds: ["hilux", "cb500"] },
  { id: "lucia", name: "Lucía M.", phone: "+56 9 7310 9925", vehicleIds: ["ranger"] },
  { id: "transp-sur", name: "Transp. Sur", phone: "+56 2 2845 1170", vehicleIds: ["scania"] },
  { id: "constr-andes", name: "Constr. Andes", phone: "+56 2 2907 3364", vehicleIds: ["cat320"] },
];

export const workshop = {
  name: "Taller CF Norte",
  plan: "Plan Pro",
  kpis: { pendientesHoy: 7, vencidos: 3, trabajosMes: 64 },
  totals: { activos: 248, pendientes: 12 },
};

// ---------------------------------------------------------------------------
// Directorio de cuentas
//
// Hace de tabla `users` mientras no exista el backend. El punto es que el rol
// vive acá y no en el formulario de login: al entrar se busca el correo y se
// descubre qué es esa cuenta, igual que haría el servidor contra la base.
//
// Nunca se guarda la contraseña, ni siquiera hasheada: hashear en el cliente no
// protege nada (el hash pasa a ser la credencial) y acá no hay a quién enviarla.
//
// Las cuentas que se crean desde el registro quedan en el localStorage del
// origen donde se crearon. Sin servidor no hay forma de compartirlas entre
// app.carfollow.io y taller.carfollow.io: son orígenes distintos.
// ---------------------------------------------------------------------------

const CLAVE_CUENTAS = "cf-cuentas";

export const seedAccounts: Account[] = [
  { email: "martin@correo.cl", role: "persona", name: "Martín R.", ownerId: "martin" },
  { email: "lucia@correo.cl", role: "persona", name: "Lucía M.", ownerId: "lucia" },
  { email: "contacto@tallercfnorte.cl", role: "taller", name: "Taller CF Norte" },
];

function storedAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(CLAVE_CUENTAS);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

const normalize = (email: string) => email.trim().toLowerCase();

/** Resuelve el rol de un correo. `undefined` = no existe la cuenta. */
export function accountByEmail(email: string): Account | undefined {
  const target = normalize(email);
  return [...seedAccounts, ...storedAccounts()].find((a) => normalize(a.email) === target);
}

export function registerAccount(account: Account): void {
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify([...storedAccounts(), account]));
}

export function vehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

export function clientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function recordsByVehicle(id: string): MaintenanceRecord[] {
  return maintenanceRecords.filter((m) => m.vehicleId === id);
}

// ---------------------------------------------------------------------------
// Derivación de recordatorios
//
// Nada de esto se guarda: el estado de un vehículo y sus próximas mantenciones
// se calculan a partir de los trabajos registrados. Registrar un trabajo mueve
// el recordatorio solo, sin que nadie tenga que sincronizar dos fuentes.
// Cuando exista el backend, este cálculo se muda a él tal cual.
// ---------------------------------------------------------------------------

const miles = (n: number) => n.toLocaleString("es-CL");

/** Meses cumplidos entre una fecha ISO y hoy. */
function monthsSince(isoDate: string, today: Date): number {
  const from = new Date(isoDate + "T00:00:00");
  let months = (today.getFullYear() - from.getFullYear()) * 12 + (today.getMonth() - from.getMonth());
  if (today.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

/** Un trabajo cubre una regla si su título o sus piezas mencionan la pieza. */
function covers(record: MaintenanceRecord, rule: PartRule): boolean {
  const text = `${record.title} ${record.parts.join(" ")}`.toLowerCase();
  return rule.keywords.some((k) => text.includes(k));
}

function statusFor(progress: number): MaintenanceStatus {
  if (progress >= 1) return "vencido";
  if (progress >= 0.8) return "pronto";
  return "ok";
}

function ruleLabel(rule: PartRule): string {
  const parts = [
    rule.intervalKm ? `cada ${miles(rule.intervalKm)} km` : null,
    rule.intervalMonths ? `o ${rule.intervalMonths} meses` : null,
  ].filter(Boolean);
  return parts.length > 1 ? `${parts.join(" · ")} — lo que ocurra primero` : parts.join("");
}

/** Lo que falta según el eje que va más adelante: el que dispara el recordatorio. */
function remainingLabel(rule: PartRule, kmDone: number, months: number, byKm: number, byTime: number): string {
  if (byKm >= byTime && rule.intervalKm) {
    const left = rule.intervalKm - kmDone;
    return left >= 0 ? `${miles(left)} km` : `vencido por ${miles(-left)} km`;
  }
  if (rule.intervalMonths) {
    const left = rule.intervalMonths - months;
    if (left >= 0) return `${left} ${left === 1 ? "mes" : "meses"}`;
    return `vencido por ${-left} ${-left === 1 ? "mes" : "meses"}`;
  }
  return "—";
}

/**
 * Próximas mantenciones de un vehículo, ordenadas de la más urgente a la menos.
 * Solo aparecen las piezas que alguna vez se registraron: sin un trabajo previo
 * no hay desde dónde contar el intervalo.
 */
export function upcomingFor(vehicleId: string, records: MaintenanceRecord[]): UpcomingService[] {
  const vehicle = vehicleById(vehicleId);
  if (!vehicle) return [];

  const today = new Date();
  const own = records.filter((r) => r.vehicleId === vehicleId);

  return partRules
    .flatMap((rule) => {
      const last = own.filter((r) => covers(r, rule)).sort((a, b) => b.date.localeCompare(a.date))[0];
      if (!last) return [];

      const kmDone = Math.max(0, vehicle.odometer - last.odometer);
      const months = monthsSince(last.date, today);
      const byKm = rule.intervalKm ? kmDone / rule.intervalKm : 0;
      const byTime = rule.intervalMonths ? months / rule.intervalMonths : 0;
      const progress = Math.max(byKm, byTime);

      return [
        {
          id: `${vehicleId}-${rule.id}`,
          vehicleId,
          part: rule.part,
          status: statusFor(progress),
          progress,
          remainingLabel: remainingLabel(rule, kmDone, months, byKm, byTime),
          ruleLabel: ruleLabel(rule),
          since: { date: last.date, odometer: last.odometer },
        },
      ];
    })
    .sort((a, b) => b.progress - a.progress);
}

/** La mantención más urgente del vehículo, o `undefined` si no tiene ninguna. */
export function nextUpcoming(vehicleId: string, records: MaintenanceRecord[]): UpcomingService | undefined {
  return upcomingFor(vehicleId, records)[0];
}

/** El estado del vehículo es el peor de sus piezas. */
export function vehicleStatus(vehicleId: string, records: MaintenanceRecord[]): MaintenanceStatus {
  const upcoming = upcomingFor(vehicleId, records);
  if (upcoming.some((u) => u.status === "vencido")) return "vencido";
  if (upcoming.some((u) => u.status === "pronto")) return "pronto";
  return "ok";
}
