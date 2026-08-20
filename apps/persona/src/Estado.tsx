/**
 * Los dos estados que aparecen en cuanto los datos vienen de la red: esperando y falló.
 * Antes no existían porque todo salía de un array en memoria.
 *
 * Viven acá y no en cada pantalla porque los usan las siete: es el tercer uso y sobra.
 */
const caja: React.CSSProperties = {
  padding: "26px 20px",
  fontSize: 12.5,
  color: "var(--cf-dim)",
  lineHeight: 1.55,
};

export function Cargando({ que }: { que: string }) {
  return (
    <div style={caja} role="status">
      Cargando {que}…
    </div>
  );
}

export function ErrorApi({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <div style={{ ...caja, color: "var(--cf-text)" }} role="alert">
      <div style={{ color: "var(--cf-danger)", fontWeight: 600, marginBottom: 6 }}>No se pudieron cargar los datos</div>
      <div style={{ marginBottom: 12 }}>{mensaje}</div>
      <button
        className="cf-tap"
        onClick={onReintentar}
        style={{
          padding: "7px 14px",
          borderRadius: 10,
          fontSize: 12.5,
          fontFamily: "inherit",
          border: "1px solid var(--cf-border)",
          background: "var(--cf-surface)",
          color: "var(--cf-text)",
          cursor: "pointer",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
