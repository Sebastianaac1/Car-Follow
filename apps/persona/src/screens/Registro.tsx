import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PiCar, PiWrench } from "react-icons/pi";
import type { IconType } from "react-icons";
import { Logo, ThemeToggle } from "@cf/ui";
import type { Account } from "@cf/types";
import { api } from "../api";
import { useSesion } from "../sesion";

/** El panel del taller corre en su propio dominio. */
const URL_TALLER = import.meta.env.VITE_URL_TALLER ?? "http://localhost:5174";

// Pasa las 200 líneas a propósito: es un formulario con sus dos variantes de tipo de
// cuenta. No hay lógica que extraer, solo campos.

/* Duplicado a propósito con Login.tsx: son dos pantallas parecidas, no la
   misma. Regla de tres: se extrae al tercer uso, no antes. */
const marco: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "72px 20px 40px",
  background: "var(--cf-bg)",
  color: "var(--cf-text)",
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
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <ThemeToggle />
      </div>
      <form onSubmit={enviar} className="cf-panel" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Logo size={40} />
          <div className="cf-display" style={{ fontSize: 28, fontWeight: 700 }}>
            Crear cuenta
          </div>
        </div>

        <span className="cf-etiqueta">Tipo de cuenta</span>
        <div role="group" aria-label="Tipo de cuenta" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <Opcion
            label="Persona"
            detalle="Tengo un vehículo"
            Icono={PiCar}
            activo={tipo === "persona"}
            onClick={() => {
              setTipo("persona");
              setError(null);
            }}
          />
          <Opcion label="Taller" detalle="Tengo un taller" Icono={PiWrench} activo={tipo === "taller"} onClick={() => setTipo("taller")} />
        </div>

        {tipo === "taller" ? (
          <p className="cf-panel" style={{ margin: "0 0 20px", padding: "12px 14px", fontSize: 14.5, color: "var(--cf-dim)" }}>
            Las cuentas de taller se crean desde el panel web. Al continuar te llevamos allá.
          </p>
        ) : (
          <>
            <label className="cf-etiqueta" htmlFor="reg-nombre">
              Nombre
            </label>
            <input
              id="reg-nombre"
              className="cf-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
              style={{ marginBottom: 16 }}
            />

            <label className="cf-etiqueta" htmlFor="reg-correo">
              Correo
            </label>
            <input
              id="reg-correo"
              className="cf-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              autoComplete="username"
              required
              style={{ marginBottom: 16 }}
            />

            <label className="cf-etiqueta" htmlFor="reg-clave">
              Contraseña
            </label>
            <input
              id="reg-clave"
              className="cf-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              style={{ marginBottom: error ? 12 : 20 }}
            />
          </>
        )}

        {error && (
          <div role="alert" style={{ fontSize: 14.5, color: "var(--cf-danger)", marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button className="cf-btn" type="submit" disabled={enviando} style={{ width: "100%", height: 46 }}>
          {tipo === "taller" ? "Ir al panel del taller" : enviando ? "Creando…" : "Crear cuenta"}
        </button>

        <div style={{ fontSize: 14.5, color: "var(--cf-dim)", marginTop: 18 }}>
          ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
        </div>

        <p style={{ fontSize: 13.5, color: "var(--cf-dim)", margin: "14px 0 0" }}>
          Tu contraseña nunca se guarda tal cual. Solo queda una versión que no se puede revertir.
        </p>
      </form>
    </div>
  );
}

function Opcion({
  label,
  detalle,
  Icono,
  activo,
  onClick,
}: {
  label: string;
  detalle: string;
  Icono: IconType;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={activo ? undefined : "cf-tap"}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        font: "inherit",
        textAlign: "left",
        border: `1px solid ${activo ? "var(--cf-accent)" : "var(--cf-border)"}`,
        background: activo ? "var(--cf-accent-soft)" : "var(--cf-surface)",
        color: activo ? "var(--cf-accent)" : "var(--cf-text)",
      }}
    >
      <Icono aria-hidden size={22} style={{ flexShrink: 0 }} />
      <span>
        <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{label}</span>
        <span style={{ display: "block", fontSize: 13, color: activo ? "inherit" : "var(--cf-dim)" }}>{detalle}</span>
      </span>
    </button>
  );
}
