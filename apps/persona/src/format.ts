import type { UpcomingService } from "@cf/types";

export function km(n: number): string {
  return n.toLocaleString("es-CL");
}

export function formatDate(iso: string): string {
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Aceite motor en 8.000 km" o "Aceite motor: vencido por 2 meses". */
export function loQueViene(u: UpcomingService): string {
  return u.status === "vencido" ? `${u.part}: ${u.remainingLabel}` : `${u.part} en ${u.remainingLabel}`;
}
