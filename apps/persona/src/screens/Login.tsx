import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@cf/ui";
import { accountByEmail } from "@cf/mock-data";
import { useSesion } from "../sesion";

/** El panel del taller corre en su propio origen. */
const URL_TALLER = "http://localhost:5174";

/* Duplicado a propósito con Registro.tsx: son dos pantallas parecidas, no la
   misma. Regla de tres — se extrae al tercer uso, no antes. */
const etiqueta: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 5, fontWeight: 500 };
const campo: React.CSSProperties = { width: "100%", borderRadius: 10, padding: "10px 12px", fontSize: 13 };

export function Login() {
  const { entrar } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { desde?: string } | null)?.desde ?? "/";

  const [email, setEmail] = useState("martin@correo.cl");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enviar = (e: FormEvent) => {
    e.preventDefault();

    // El rol no se elige: se busca la cuenta y se descubre qué es.
    const cuenta = accountByEmail(email);
    if (!cuenta) {
      setError("No hay ninguna cuenta con ese correo.");
      return;
    }
    if (cuenta.role !== "persona") {
      window.location.href = URL_TALLER;
      return;
    }
    entrar({ email: cuenta.email, nombre: cuenta.name, ownerId: cuenta.ownerId ?? "" });
    navigate(destino, { replace: true });
  };

  return (
    <form onSubmit={enviar} style={{ flex: 1, display: "flex", flexDirection: "column", padding: "26px 22px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 26 }}>
        <Logo size={38} radius={11} font={15} />
        <div>
          <div className="cf-display" style={{ fontWeight: 700, fontSize: 17, lineHeight: 1 }}>
            Car Follow
          </div>
          <div className="cf-mono" style={{ fontSize: 10, color: "var(--cf-accent)", marginTop: 4 }}>
            App de la persona
          </div>
        </div>
      </div>

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
        style={{ ...campo, marginBottom: 13 }}
      />

      <div style={etiqueta}>Contraseña</div>
      <input
        className="cf-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        placeholder="cualquier valor sirve"
        style={{ ...campo, marginBottom: error ? 11 : 16 }}
      />

      {error && (
        <div role="alert" style={{ fontSize: 12, color: "var(--cf-danger)", marginBottom: 13 }}>
          {error}
        </div>
      )}

      <button className="cf-btn" type="submit" style={{ width: "100%", height: 44, borderRadius: 12, fontSize: 14 }}>
        Entrar
      </button>

      <div style={{ fontSize: 12, color: "var(--cf-dim)", marginTop: 14 }}>
        ¿No tienes cuenta? <Link to="/registro">Crear una</Link>
      </div>

      <div style={{ flex: 1, minHeight: 14 }} />

      <p style={{ fontSize: 10.5, lineHeight: 1.5, color: "var(--cf-dim)", margin: 0 }}>
        <strong style={{ color: "var(--cf-text)" }}>Demo sin backend.</strong> El tipo de cuenta se resuelve buscando el
        correo en un directorio local; si la cuenta es de taller te mandamos al panel web. La contraseña no se valida ni
        se guarda en ninguna parte.
      </p>
    </form>
  );
}
