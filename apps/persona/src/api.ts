import { useEffect, useState } from "react";
import { cerrarSesion, leerSesion } from "./sesion";

/**
 * El puente con el backend. Cada pantalla pide lo suyo con `useApi`; no hay un store que
 * cargue todo de golpe, así que lo que se muestra es siempre lo que se acaba de traer.
 *
 * Acá vive el `cargando` y el `error` una sola vez para que las pantallas no repitan el
 * mismo bloque de `useState` + `useEffect` quince veces.
 */
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Opciones = { metodo: "POST" | "PATCH"; cuerpo: unknown };

export async function api<T>(ruta: string, opciones?: Opciones): Promise<T> {
    const sesion = leerSesion();

    const respuesta = await fetch(BASE + ruta, {
        method: opciones?.metodo ?? "GET",
        headers: {
            ...(opciones ? { "Content-Type": "application/json" } : {}),
            ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}),
        },
        body: opciones ? JSON.stringify(opciones.cuerpo) : undefined,
    });

    // El token dura 7 días: volver después de una semana y encontrarse una pantalla rota
    // es un caso que va a pasar, no una hipótesis. Se corta la sesión y se vuelve a entrar.
    if (respuesta.status === 401) {
        cerrarSesion();
        window.location.href = "/login";
        throw new Error("Tu sesión venció. Entra de nuevo.");
    }

    if (!respuesta.ok) {
        // Nest manda { message } y, si falló la validación, message es un arreglo.
        const cuerpo = await respuesta.json().catch(() => null);
        const mensaje = cuerpo?.message;
        throw new Error(Array.isArray(mensaje) ? mensaje.join(". ") : mensaje ?? "No se pudo conectar con el servidor.");
    }

    return respuesta.json() as Promise<T>;
}

export function useApi<T>(ruta: string) {
    const [datos, setDatos] = useState<T | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Cambiarlo vuelve a disparar el efecto: es todo lo que hace recargar().
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let vigente = true;
        setCargando(true);

        api<T>(ruta)
            .then((d) => {
                if (!vigente) return;
                setDatos(d);
                setError(null);
            })
            .catch((e: Error) => vigente && setError(e.message))
            .finally(() => vigente && setCargando(false));

        // Si la pantalla cambia de ruta antes de que llegue la respuesta, la vieja se
        // descarta. Sin esto, pasar rápido de un vehículo a otro puede pintar los datos
        // del anterior sobre la ficha del nuevo.
        return () => {
            vigente = false;
        };
    }, [ruta, intento]);

    return { datos, cargando, error, recargar: () => setIntento((n) => n + 1) };
}
