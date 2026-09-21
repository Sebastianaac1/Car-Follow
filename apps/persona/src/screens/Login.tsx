import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import type { Account } from "@cf/types";
import { api } from "../api";
import { useSesion } from "../sesion";

/** El panel del taller corre en su propio dominio. */
const URL_TALLER = import.meta.env.VITE_URL_TALLER ?? "http://localhost:5174";

/* Duplicado a propósito con Registro.tsx: son dos pantallas parecidas, no la
   misma. Regla de tres — se extrae al tercer uso, no antes. */
const etiqueta: React.CSSProperties = { fontSize: 11, color: "var(--cf-dim)", marginBottom: 5, fontWeight: 500 };
const campo: React.CSSProperties = { width: "100%", borderRadius: 10, padding: "11px 13px", fontSize: 13.5 };
/* Antes esta pantalla ocupaba el alto del marco de telefono; ahora es una pagina web y
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

export function Login() {
  const { entrar } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { desde?: string } | null)?.desde ?? "/";

  const [email, setEmail] = useState("martin@correo.cl");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      // El rol sigue sin elegirse: se manda correo y clave, y el rol viene en la
      // respuesta. El servidor responde lo mismo si el correo no existe o si la
      // contraseña está mal, así que este mensaje no delata qué correos hay registrados.
      const { token, cuenta } = await api<{ token: string; cuenta: Account }>("/auth/login", {
        metodo: "POST",
        cuerpo: { email, password },
      });

      if (cuenta.role !== "persona") {
        window.location.href = URL_TALLER;
        return;
      }
      entrar({ token, email: cuenta.email, nombre: cuenta.name });
      navigate(destino, { replace: true });
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
        required
        style={{ ...campo, marginBottom: error ? 11 : 16 }}
      />

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
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      <div style={{ fontSize: 12, color: "var(--cf-dim)", marginTop: 14 }}>
        ¿No tienes cuenta? <Link to="/registro">Crear una</Link>
      </div>

      <p style={{ fontSize: 11.5, lineHeight: 1.55, color: "var(--cf-dim)", margin: "14px 0 0" }}>
        El tipo de cuenta no se elige: sale de la cuenta al entrar, y si es de taller te mandamos a su panel. La
        contraseña viaja al servidor, que la compara contra un hash Argon2id — nunca se guarda en el navegador.
      </p>
      </form>
    </div>
  );
}
