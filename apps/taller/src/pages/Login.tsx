import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import { accountByEmail } from "@cf/mock-data";
import { useSesion } from "../sesion";

/** La app de la persona corre en su propio origen. */
const URL_PERSONA = "http://localhost:5173";

/* Duplicado a propósito con Registro.tsx: son dos pantallas parecidas, no la
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

export function Login() {
  const { entrar } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { desde?: string } | null)?.desde ?? "/";

  const [email, setEmail] = useState("contacto@tallercfnorte.cl");
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
    if (cuenta.role !== "taller") {
      window.location.href = URL_PERSONA;
      return;
    }
    entrar({ email: cuenta.email, nombre: cuenta.name });
    navigate(destino, { replace: true });
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
              Car Follow
            </div>
            <div className="cf-mono" style={{ fontSize: 10.5, color: "var(--cf-accent)", marginTop: 4 }}>
              Panel del taller
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
          style={{ ...campo, marginBottom: 14 }}
        />

        <div style={etiqueta}>Contraseña</div>
        <input
          className="cf-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="cualquier valor sirve"
          style={{ ...campo, marginBottom: error ? 12 : 18 }}
        />

        {error && (
          <div role="alert" style={{ fontSize: 12.5, color: "var(--cf-danger)", marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button className="cf-btn" type="submit" style={{ width: "100%", height: 44, borderRadius: 12, fontSize: 14 }}>
          Entrar
        </button>

        <div style={{ fontSize: 12.5, color: "var(--cf-dim)", marginTop: 16 }}>
          ¿No tienes cuenta? <Link to="/registro">Crear una</Link>
        </div>

        <p style={{ fontSize: 11.5, lineHeight: 1.55, color: "var(--cf-dim)", margin: "14px 0 0" }}>
          <strong style={{ color: "var(--cf-text)" }}>Demo sin backend.</strong> El tipo de cuenta se resuelve buscando
          el correo en un directorio local; si la cuenta es de persona te mandamos a la app móvil. La contraseña no se
          valida ni se guarda en ninguna parte. La autenticación real (JWT, hash Argon2id en el servidor) está diseñada
          en el README y todavía no existe en código.
        </p>
      </form>
    </div>
  );
}
