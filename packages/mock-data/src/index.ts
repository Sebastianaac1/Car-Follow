import type {
  Alert,
  Client,
  MaintenanceRecord,
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
    status: "ok",
  },
  {
    id: "cb500",
    name: "Honda CB500",
    plate: "moto",
    kind: "moto",
    odometer: 21050,
    ownerId: "martin",
    ownerName: "Martín R.",
    status: "pronto",
  },
  {
    id: "ranger",
    name: "Ford Ranger",
    plate: "PQRS·08",
    kind: "auto",
    odometer: 61200,
    ownerId: "lucia",
    ownerName: "Lucía M.",
    status: "vencido",
  },
  {
    id: "scania",
    name: "Scania R450",
    plate: "camión",
    kind: "camion",
    odometer: 305400,
    ownerId: "transp-sur",
    ownerName: "Transp. Sur",
    status: "pronto",
  },
  {
    id: "cat320",
    name: "Cat 320 (excav.)",
    plate: "maquinaria",
    kind: "maquinaria",
    odometer: 12400,
    ownerId: "constr-andes",
    ownerName: "Constr. Andes",
    status: "ok",
  },
];

export const upcomingByVehicle: Record<string, UpcomingService[]> = {
  hilux: [
    {
      id: "u-hilux-aceite",
      vehicleId: "hilux",
      part: "Cambio de aceite",
      status: "ok",
      progress: 0.84,
      remainingLabel: "1.680 km",
      ruleLabel: "cada 10.000 km · o 12 meses — lo que ocurra primero",
    },
    {
      id: "u-hilux-rot",
      vehicleId: "hilux",
      part: "Rotación neumáticos",
      status: "pronto",
      progress: 0.66,
      remainingLabel: "2 meses",
      ruleLabel: "cada 10.000 km · o 6 meses",
    },
  ],
  cb500: [
    {
      id: "u-cb500-frenos",
      vehicleId: "cb500",
      part: "Frenos",
      status: "pronto",
      progress: 0.92,
      remainingLabel: "320 km",
      ruleLabel: "cada 20.000 km · o 24 meses",
    },
  ],
};

/** Etiqueta corta del próximo servicio para las tarjetas del garaje / tabla del taller. */
export const nextServiceLabel: Record<string, { text: string; progress: number }> = {
  hilux: { text: "84.320 km · próx. aceite en 1.680 km", progress: 0.84 },
  cb500: { text: "21.050 km · frenos en 320 km", progress: 0.92 },
};

export const partRules: PartRule[] = [
  { id: "r-aceite", part: "Aceite motor", intervalKm: 10000, intervalMonths: 12 },
  { id: "r-aire", part: "Filtro de aire", intervalKm: 15000, intervalMonths: 24 },
  { id: "r-frenos", part: "Pastillas de freno", intervalKm: 30000, intervalMonths: 36 },
  { id: "r-correa", part: "Correa de distribución", intervalKm: 80000, intervalMonths: 60 },
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
];

export const alerts: Alert[] = [
  {
    id: "a-frenos",
    level: "vencido",
    title: "Frenos vencidos",
    vehicleName: "Honda CB500",
    body: "Superaste el intervalo por 180 km. Agenda el cambio pronto.",
    actions: [
      { label: "Agendar taller", primary: true },
      { label: "Ya lo hice" },
    ],
  },
  {
    id: "a-aceite",
    level: "pronto",
    title: "Aceite pronto",
    vehicleName: "Toyota Hilux",
    body: "Faltan 1.680 km o 2 meses para el cambio de aceite.",
  },
  {
    id: "a-registro",
    level: "info",
    title: "Nuevo registro del taller",
    vehicleName: "Toyota Hilux",
    meta: "hace 2 h",
    body: "Taller CF Norte añadió “cambio de aceite” a tu Hilux. Revísalo y confírmalo.",
  },
];

/** Para el panel del taller: próximo servicio + estado por vehículo en la tabla. */
export const workshopRows = [
  { vehicleId: "hilux", next: "Aceite · 1.680 km" },
  { vehicleId: "ranger", next: "Frenos · vencido" },
  { vehicleId: "scania", next: "Filtro · 12 días" },
  { vehicleId: "cb500", next: "Frenos · 320 km" },
  { vehicleId: "cat320", next: "Hidráulico · 40 h" },
];

export const clients: Client[] = [
  { id: "martin", name: "Martín R.", vehicleIds: ["hilux", "cb500"], plan: "particular" },
  { id: "lucia", name: "Lucía M.", vehicleIds: ["ranger"], plan: "particular" },
  { id: "transp-sur", name: "Transp. Sur", vehicleIds: ["scania"], plan: "particular" },
  { id: "constr-andes", name: "Constr. Andes", vehicleIds: ["cat320"], plan: "particular" },
];

export const workshop = {
  name: "Taller CF Norte",
  plan: "Plan Pro",
  kpis: { pendientesHoy: 7, vencidos: 3, trabajosMes: 64 },
  totals: { activos: 248, pendientes: 12 },
};

export function vehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

export function recordsByVehicle(id: string): MaintenanceRecord[] {
  return maintenanceRecords.filter((m) => m.vehicleId === id);
}
