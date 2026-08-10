import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@cf/ui";
import { accountByEmail, registerAccount } from "@cf/mock-data";
import { useSesion } from "../sesion";

/** El panel del taller corre en su propio origen. */
const URL_TALLER = "http://localhost:5174/registro";

/* Duplicado a propósito con Login.tsx: son dos pantallas parecidas, no la
   misma. Regla de tres — se extrae al tercer uso, no antes. */
const etiqueta: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 5, fontWeight: 500 };
const campo: React.CSSProperties = { width: "100%", borderRadius: 10, padding: "10px 12px", fontSize: 13 };

type Tipo = "persona" | "taller";

export function Registro() {
  const { entrar } = useSesion();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<Tipo>("persona");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enviar = (e: FormEvent) => {
    e.preventDefault();

    // Las cuentas de taller se crean en la otra app: sin servidor no hay un
    // directorio compartido entre los dos orígenes.
    if (tipo === "taller") {
      window.location.href = URL_TALLER;
      return;
    }
    if (accountByEmail(email)) {
      setError("Ya existe una cuenta con ese correo.");
      return;
    }

    // El ownerId nuevo no tiene vehículos: el garaje arranca vacío, como debe ser.
    // La contraseña no se guarda: no hay servidor que la reciba y hashearla en el
    // cliente no protegería nada.
    const ownerId = `u-${Date.now()}`;
    registerAccount({ email: email.trim(), role: "persona", name: nombre.trim(), ownerId });
    entrar({ email: email.trim(), nombre: nombre.trim(), ownerId });
    navigate("/", { replace: true });
  };

  return (
    <form onSubmit={enviar} style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 22px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
        <Logo size={38} radius={11} font={15} />
        <div>
          <div className="cf-display" style={{ fontWeight: 700, fontSize: 17, lineHeight: 1 }}>
            Crear cuenta
          </div>
          <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-accent)", marginTop: 4 }}>
            Car Follow
          </div>
        </div>
      </div>

      <div style={etiqueta}>Tipo de cuenta</div>
      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        <Opcion
          label="Persona"
          detalle="App móvil"
          activo={tipo === "persona"}
          onClick={() => {
            setTipo("persona");
            setError(null);
          }}
        />
        <Opcion label="Taller" detalle="Panel web" activo={tipo === "taller"} onClick={() => setTipo("taller")} />
      </div>

      {tipo === "taller" ? (
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--cf-dim)",
            border: "1px solid var(--cf-border)",
            borderRadius: 10,
            padding: "11px 12px",
            marginBottom: 16,
          }}
        >
          Las cuentas de taller se crean desde el panel web. Al continuar te llevamos allá.
        </div>
      ) : (
        <>
          <div style={etiqueta}>Nombre</div>
          <input
            className="cf-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            style={{ ...campo, marginBottom: 12 }}
          />

          <div style={etiqueta}>Correo</div>
          <input
            className="cf-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            autoComplete="username"
            required
            style={{ ...campo, marginBottom: 12 }}
          />

          <div style={etiqueta}>Contraseña</div>
          <input
            className="cf-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            style={{ ...campo, marginBottom: error ? 11 : 16 }}
          />
        </>
      )}

      {error && (
        <div role="alert" style={{ fontSize: 12, color: "var(--cf-danger)", marginBottom: 13 }}>
          {error}
        </div>
      )}

      <button className="cf-btn" type="submit" style={{ width: "100%", height: 44, borderRadius: 12, fontSize: 14 }}>
        {tipo === "taller" ? "Ir al panel del taller →" : "Crear cuenta"}
      </button>

      <div style={{ fontSize: 12, color: "var(--cf-dim)", marginTop: 14 }}>
        ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
      </div>

      <div style={{ flex: 1, minHeight: 14 }} />

      <p style={{ fontSize: 10.5, lineHeight: 1.5, color: "var(--cf-dim)", margin: 0 }}>
        <strong style={{ color: "var(--cf-text)" }}>Demo sin backend.</strong> La cuenta queda en el almacenamiento de
        este navegador. La contraseña no se guarda en ninguna parte.
      </p>
    </form>
  );
}

function Opcion({
  label,
  detalle,
  activo,
  onClick,
}: {
  label: string;
  detalle: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className="cf-tap"
      style={{
        flex: 1,
        padding: "9px 11px",
        borderRadius: 10,
        fontFamily: "inherit",
        cursor: "pointer",
        textAlign: "left",
        border: `1px solid ${activo ? "var(--cf-accent)" : "var(--cf-border)"}`,
        background: activo ? "var(--cf-accent-soft)" : "transparent",
        color: activo ? "var(--cf-accent)" : "var(--cf-dim)",
      }}
    >
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600 }}>{label}</span>
      <span className="cf-mono" style={{ display: "block", fontSize: 9.5, marginTop: 2, opacity: 0.85 }}>
        {detalle}
      </span>
    </button>
  );
}
