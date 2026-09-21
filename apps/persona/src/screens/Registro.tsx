import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import type { Account } from "@cf/types";
import { api } from "../api";
import { useSesion } from "../sesion";

/** El panel del taller corre en su propio dominio. */
const URL_TALLER = import.meta.env.VITE_URL_TALLER ?? "http://localhost:5174";

/* Duplicado a propósito con Login.tsx: son dos pantallas parecidas, no la
   misma. Regla de tres — se extrae al tercer uso, no antes. */
const etiqueta: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 5, fontWeight: 500 };
const campo: React.CSSProperties = { width: "100%", borderRadius: 10, padding: "11px 13px", fontSize: 13.5 };
/* Antes esta pantalla ocupaba el alto del marco de teléfono; ahora es una página web y
   se centra sola en la ventana. */
const marco: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(760px 420px at 50% -10%, var(--cf-accent-soft), transparent 70%), var(--cf-bg)",
  color: "var(--cf-text)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

type Tipo = "persona" | "taller";

export function Registro() {
  const { entrar } = useSesion();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<Tipo>("persona");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();

    // Las cuentas de taller se crean desde el panel web: es la misma API, pero el panel
    // pide los datos del negocio y no los de una persona.
    if (tipo === "taller") {
      window.location.href = `${URL_TALLER}/registro`;
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      // El 409 por correo repetido lo decide el servidor: acá no hay forma de saber qué
      // correos existen, y así debe ser.
      const { token, cuenta } = await api<{ token: string; cuenta: Account }>("/auth/registro", {
        metodo: "POST",
        cuerpo: { email: email.trim(), password, nombre: nombre.trim(), rol: "persona" },
      });
      // El garaje arranca vacío: la cuenta nueva todavía no tiene ningún vehículo.
      entrar({ token, email: cuenta.email, nombre: cuenta.name });
      navigate("/", { replace: true });
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
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
          detalle="Dueño de vehículo"
          activo={tipo === "persona"}
          onClick={() => {
            setTipo("persona");
            setError(null);
          }}
        />
        <Opcion label="Taller" detalle="Panel del negocio" activo={tipo === "taller"} onClick={() => setTipo("taller")} />
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
            minLength={8}
            placeholder="mínimo 8 caracteres"
            style={{ ...campo, marginBottom: error ? 11 : 16 }}
          />
        </>
      )}

      {error && (
        <div role="alert" style={{ fontSize: 12, color: "var(--cf-danger)", marginBottom: 13 }}>
          {error}
        </div>
      )}

      <button
        className="cf-btn"
        type="submit"
        disabled={enviando}
        style={{ width: "100%", height: 44, borderRadius: 12, fontSize: 14, opacity: enviando ? 0.6 : 1 }}
      >
        {tipo === "taller" ? "Ir al panel del taller →" : enviando ? "Creando…" : "Crear cuenta"}
      </button>

      <div style={{ fontSize: 12, color: "var(--cf-dim)", marginTop: 14 }}>
        ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
      </div>

      <div style={{ flex: 1, minHeight: 14 }} />

      <p style={{ fontSize: 10.5, lineHeight: 1.5, color: "var(--cf-dim)", margin: 0 }}>
        La cuenta se crea en el servidor. La contraseña se guarda como un hash Argon2id y no vuelve nunca: ni en esta
        respuesta ni en ninguna otra.
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
