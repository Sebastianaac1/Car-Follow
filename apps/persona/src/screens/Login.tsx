import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo, ThemeToggle } from "@cf/ui";
import type { Account } from "@cf/types";
import { api } from "../api";
import { useSesion } from "../sesion";

/** El panel del taller corre en su propio dominio. */
const URL_TALLER = import.meta.env.VITE_URL_TALLER ?? "http://localhost:5174";

/* Duplicado a propósito con Registro.tsx: son dos pantallas parecidas, no la
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
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <ThemeToggle />
      </div>
      <form onSubmit={enviar} className="cf-panel" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Logo size={40} />
          <div>
            <div className="cf-display" style={{ fontSize: 28, fontWeight: 700 }}>
              Car Follow
            </div>
            <div style={{ fontSize: 14.5, color: "var(--cf-dim)" }}>La libreta de mantención de tus vehículos</div>
          </div>
        </div>

        <label className="cf-etiqueta" htmlFor="login-correo">
          Correo
        </label>
        <input
          id="login-correo"
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

        <label className="cf-etiqueta" htmlFor="login-clave">
          Contraseña
        </label>
        <input
          id="login-clave"
          className="cf-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          style={{ marginBottom: error ? 12 : 20 }}
        />

        {error && (
          <div role="alert" style={{ fontSize: 14.5, color: "var(--cf-danger)", marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button className="cf-btn" type="submit" disabled={enviando} style={{ width: "100%", height: 46 }}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>

        <div style={{ fontSize: 14.5, color: "var(--cf-dim)", marginTop: 18 }}>
          ¿No tienes cuenta? <Link to="/registro">Crear una</Link>
        </div>

        <p style={{ fontSize: 13.5, color: "var(--cf-dim)", margin: "14px 0 0" }}>
          Si tu cuenta es de taller, al entrar te llevamos a su panel. Tu contraseña no se guarda en este navegador.
        </p>
      </form>
    </div>
  );
}
