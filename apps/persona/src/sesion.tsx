import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Sesión de la app de la persona.
 *
 * Prototipo: no hay servidor que valide nada. Esto solo recuerda quién dijo ser
 * el usuario para poder enrutar y mostrar su nombre. La verificación real
 * (login contra la API, JWT firmado, guard de propiedad por endpoint) vive en el
 * plan de backend del README y todavía no existe en código.
 *
 * Se guarda en sessionStorage y no en localStorage a propósito: es lo mismo que
 * hará el JWT cuando exista, para reducir la ventana de exposición ante XSS.
 */
const CLAVE = "cf-sesion-persona";

export interface Sesion {
  email: string;
  nombre: string;
  ownerId: string;
}

interface SesionContextValue {
  sesion: Sesion | null;
  entrar: (sesion: Sesion) => void;
  salir: () => void;
}

const SesionContext = createContext<SesionContextValue | null>(null);

function leer(): Sesion | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Sesion) : null;
  } catch {
    return null;
  }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leer);

  const value = useMemo<SesionContextValue>(
    () => ({
      sesion,
      entrar: (s) => {
        sessionStorage.setItem(CLAVE, JSON.stringify(s));
        setSesion(s);
      },
      salir: () => {
        sessionStorage.removeItem(CLAVE);
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
