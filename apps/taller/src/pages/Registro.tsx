import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import { accountByEmail, registerAccount } from "@cf/mock-data";
import { useSesion } from "../sesion";

/** La app de la persona corre en su propio origen. */
const URL_PERSONA = "http://localhost:5173/registro";

/* Duplicado a propósito con Login.tsx: son dos pantallas parecidas, no la
   misma. Regla de tres — se extrae al tercer uso, no antes. */
const etiqueta: React.CSSProperties = { fontSize: 11.5, color: "var(--cf-dim)", marginBottom: 6, fontWeight: 500 };
const campo: React.CSSProperties = { width: "100%", borderRadius: 10, padding: "11px 13px", fontSize: 13.5 };
const marco: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(760px 420px at 50% -10%, var(--cf-accent-soft), transparent 70%), var(--cf-bg)",
  color: "var(--cf-text)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

type Tipo = "taller" | "persona";

export function Registro() {
  const { entrar } = useSesion();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<Tipo>("taller");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enviar = (e: FormEvent) => {
    e.preventDefault();

    // Las cuentas de persona se crean en la otra app: sin servidor no hay un
    // directorio compartido entre los dos orígenes.
    if (tipo === "persona") {
      window.location.href = URL_PERSONA;
      return;
    }
    if (accountByEmail(email)) {
      setError("Ya existe una cuenta con ese correo.");
      return;
    }

    // La contraseña no se guarda: no hay servidor que la reciba y hashearla
    // en el cliente no protegería nada.
    registerAccount({ email: email.trim(), role: "taller", name: nombre.trim() });
    entrar({ email: email.trim(), nombre: nombre.trim() });
    navigate("/", { replace: true });
  };

  return (
    <div style={marco}>
      <div style={{ position: "absolute", top: 24, right: 24 }}>
        <ThemeToggle />
      </div>

      <form
        onSubmit={enviar}
        style={{
          width: "100%",
          maxWidth: 380,
          border: "1px solid var(--cf-border)",
          borderRadius: 18,
          background: "var(--cf-surface)",
          padding: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <Logo size={40} radius={12} font={16} />
          <div>
            <div className="cf-display" style={{ fontWeight: 700, fontSize: 18, lineHeight: 1 }}>
              Crear cuenta
            </div>
            <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-accent)", marginTop: 4 }}>
              Car Follow
            </div>
          </div>
        </div>

        <div style={etiqueta}>Tipo de cuenta</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <Opcion
            label="Taller"
            detalle="Panel web"
            activo={tipo === "taller"}
            onClick={() => {
              setTipo("taller");
              setError(null);
            }}
          />
          <Opcion label="Persona" detalle="App móvil" activo={tipo === "persona"} onClick={() => setTipo("persona")} />
        </div>

        {tipo === "persona" ? (
          <div
            style={{
              fontSize: 12.5,
              lineHeight: 1.5,
              color: "var(--cf-dim)",
              border: "1px solid var(--cf-border)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 18,
            }}
          >
            Las cuentas de persona se crean desde la app móvil. Al continuar te llevamos allá.
          </div>
        ) : (
          <>
            <div style={etiqueta}>Nombre del taller</div>
            <input
              className="cf-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Taller CF Sur"
              required
              style={{ ...campo, marginBottom: 14 }}
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
              style={{ ...campo, marginBottom: 14 }}
            />

            <div style={etiqueta}>Contraseña</div>
            <input
              className="cf-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              style={{ ...campo, marginBottom: error ? 12 : 18 }}
            />
          </>
        )}

        {error && (
          <div role="alert" style={{ fontSize: 12.5, color: "var(--cf-danger)", marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button className="cf-btn" type="submit" style={{ width: "100%", height: 44, borderRadius: 12, fontSize: 14 }}>
          {tipo === "persona" ? "Ir a la app de la persona →" : "Crear cuenta de taller"}
        </button>

        <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginTop: 16 }}>
          ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
        </div>

        <p style={{ fontSize: 11.5, lineHeight: 1.55, color: "var(--cf-dim)", margin: "14px 0 0" }}>
          <strong style={{ color: "var(--cf-text)" }}>Demo sin backend.</strong> La cuenta queda en el almacenamiento
          de este navegador y solo sirve para entrar acá. La contraseña no se guarda en ninguna parte.
        </p>
      </form>
    </div>
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
        padding: "10px 12px",
        borderRadius: 10,
        fontFamily: "inherit",
        cursor: "pointer",
        textAlign: "left",
        border: `1px solid ${activo ? "var(--cf-accent)" : "var(--cf-border)"}`,
        background: activo ? "var(--cf-accent-soft)" : "transparent",
        color: activo ? "var(--cf-accent)" : "var(--cf-dim)",
      }}
    >
      <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span className="cf-mono" style={{ display: "block", fontSize: 10, marginTop: 2, opacity: 0.85 }}>
        {detalle}
      </span>
    </button>
  );
}
