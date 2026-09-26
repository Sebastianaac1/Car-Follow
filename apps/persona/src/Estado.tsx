import { PiArrowClockwise, PiWarningCircle } from "react-icons/pi";

/**
 * Los dos estados que aparecen en cuanto los datos vienen de la red: esperando y falló.
 * Antes no existían porque todo salía de un array en memoria.
 *
 * Viven acá y no en cada pantalla porque los usan las siete: es el tercer uso y sobra.
 */
export function Cargando({ que }: { que: string }) {
  return (
    <div role="status" style={{ padding: "32px 0", fontSize: 15, color: "var(--cf-dim)" }}>
      Cargando {que}…
    </div>
  );
}

export function ErrorApi({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <div role="alert" className="cf-panel" style={{ padding: 20, maxWidth: 520 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--cf-danger)", fontWeight: 600 }}>
        <PiWarningCircle aria-hidden size={20} />
        No se pudieron cargar los datos
      </div>
      <p style={{ margin: "6px 0 16px", fontSize: 15 }}>{mensaje}</p>
      <button className="cf-btn-quieto" onClick={onReintentar}>
        <PiArrowClockwise aria-hidden />
        Reintentar
      </button>
    </div>
  );
}
