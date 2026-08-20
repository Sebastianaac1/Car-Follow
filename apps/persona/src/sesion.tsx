import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Sesión de la app de la persona.
 *
 * El token lo firma el backend y viaja en cada petición dentro del header Authorization.
 * Acá solo se guarda; la app nunca lo abre ni lee lo que dice adentro.
 *
 * Se guarda en sessionStorage y no en localStorage a propósito: reduce la ventana de
 * exposición ante XSS. El precio es que cerrar la pestaña cierra la sesión.
 */
const CLAVE = "cf-sesion-persona";

export interface Sesion {
  token: string;
  email: string;
  nombre: string;
}

interface SesionContextValue {
  sesion: Sesion | null;
  entrar: (sesion: Sesion) => void;
  salir: () => void;
}

const SesionContext = createContext<SesionContextValue | null>(null);

/** Lee la sesión guardada. La usa api.ts para sacar el token sin pasar por React. */
export function leerSesion(): Sesion | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Sesion) : null;
  } catch {
    return null;
  }
}

/** Borra la sesión desde fuera de React: api.ts la llama cuando el backend responde 401. */
export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE);
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);

  const value = useMemo<SesionContextValue>(
    () => ({
      sesion,
      entrar: (s) => {
        sessionStorage.setItem(CLAVE, JSON.stringify(s));
        setSesion(s);
      },
      salir: () => {
        cerrarSesion();
        setSesion(null);
      },
    }),
    [sesion],
  );

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return ctx;
}
