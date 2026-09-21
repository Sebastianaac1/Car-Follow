export function km(n: number): string {
  return n.toLocaleString("es-CL");
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/**
 * Marca de tiempo de una revisión. El servidor manda `createdAt` en ISO con hora, que es
 * justo lo que un audit trail necesita mostrar: no alcanza con el día.
 *
 * Vive acá y no inline en las dos pantallas que la usan porque este archivo ya es el
 * lugar de los formatos de esta app — es una tercera función al lado de km y formatDate,
 * no una capa nueva.
 */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const dia = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${dia} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
