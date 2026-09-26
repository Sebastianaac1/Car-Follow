export type ThemeName = "dark" | "light";

/**
 * Paleta de Car Follow. Sale del mundo del vehículo y no de una plantilla:
 * papel de libreta de servicio, asfalto, tinta de timbre (azul del taller, violeta de la
 * persona), aceite para lo que está por vencer, rojo de señal para lo vencido y verde de
 * revisión técnica para lo que está al día. La patente es un objeto físico: queda clara
 * en los dos temas.
 */
export const palettes: Record<ThemeName, Record<string, string>> = {
  light: {
    "--cf-bg": "#eef0eb",
    "--cf-surface": "#fafbf8",
    "--cf-surface-2": "#e4e7e0",
    "--cf-border": "#cdd2c9",
    "--cf-text": "#1c2226",
    "--cf-dim": "#5b646a",
    "--cf-accent": "#2b45a6",
    "--cf-accent-soft": "rgba(43,69,166,0.10)",
    "--cf-persona": "#6d3f9e",
    "--cf-persona-soft": "rgba(109,63,158,0.10)",
    "--cf-ok": "#2a7248",
    "--cf-ok-soft": "rgba(42,114,72,0.12)",
    "--cf-warn": "#8f5a0a",
    "--cf-warn-soft": "rgba(143,90,10,0.13)",
    "--cf-danger": "#b8321f",
    "--cf-danger-soft": "rgba(184,50,31,0.10)",
    "--cf-on-accent": "#ffffff",
    "--cf-plate-bg": "#fbfbf7",
    "--cf-plate-ink": "#15191c",
    "--cf-plate-rim": "rgba(21,25,28,0.22)",
    "--cf-rail": "#20262c",
    "--cf-rail-text": "#dfe3dc",
    "--cf-rail-dim": "#98a1a6",
  },
  dark: {
    "--cf-bg": "#1a1f24",
    "--cf-surface": "#232a30",
    "--cf-surface-2": "#2c343b",
    "--cf-border": "#38414a",
    "--cf-text": "#e6e9e2",
    "--cf-dim": "#9aa3a8",
    "--cf-accent": "#8fa6f2",
    "--cf-accent-soft": "rgba(143,166,242,0.14)",
    "--cf-persona": "#c3a0e8",
    "--cf-persona-soft": "rgba(195,160,232,0.14)",
    "--cf-ok": "#6cc08d",
    "--cf-ok-soft": "rgba(108,192,141,0.14)",
    "--cf-warn": "#e0a84a",
    "--cf-warn-soft": "rgba(224,168,74,0.14)",
    "--cf-danger": "#f18777",
    "--cf-danger-soft": "rgba(241,135,119,0.13)",
    "--cf-on-accent": "#141a26",
    "--cf-plate-bg": "#e9ebe4",
    "--cf-plate-ink": "#15191c",
    "--cf-plate-rim": "rgba(21,25,28,0.25)",
    "--cf-rail": "#14181c",
    "--cf-rail-text": "#dfe3dc",
    "--cf-rail-dim": "#8d969b",
  },
};

export function applyTheme(el: HTMLElement, theme: ThemeName) {
  const vars = palettes[theme];
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value);
  }
}
