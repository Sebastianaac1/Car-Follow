export type ThemeName = "dark" | "light";

/** Paleta CF exacta portada desde el diseño de Claude Design. */
export const palettes: Record<ThemeName, Record<string, string>> = {
  dark: {
    "--cf-bg": "#0b0f14",
    "--cf-surface": "#131a22",
    "--cf-surface-2": "#1c2530",
    "--cf-border": "#26303d",
    "--cf-text": "#e8edf2",
    "--cf-dim": "#8593a2",
    "--cf-accent": "#f97316",
    "--cf-accent-soft": "rgba(249,115,22,0.16)",
    "--cf-persona": "#60a5fa",
    "--cf-persona-soft": "rgba(96,165,250,0.16)",
    "--cf-ok": "#34d399",
    "--cf-ok-soft": "rgba(52,211,153,0.15)",
    "--cf-warn": "#fbbf24",
    "--cf-warn-soft": "rgba(251,191,36,0.15)",
    "--cf-danger": "#f87171",
    "--cf-danger-soft": "rgba(248,113,113,0.13)",
    "--cf-on-accent": "#0b0f14",
  },
  light: {
    "--cf-bg": "#eceff3",
    "--cf-surface": "#ffffff",
    "--cf-surface-2": "#f2f5f8",
    "--cf-border": "#dbe1e8",
    "--cf-text": "#0f1720",
    "--cf-dim": "#5d6875",
    "--cf-accent": "#e5620d",
    "--cf-accent-soft": "rgba(229,98,13,0.12)",
    "--cf-persona": "#2563eb",
    "--cf-persona-soft": "rgba(37,99,235,0.12)",
    "--cf-ok": "#0f9d63",
    "--cf-ok-soft": "rgba(15,157,99,0.12)",
    "--cf-warn": "#b7791f",
    "--cf-warn-soft": "rgba(183,121,31,0.13)",
    "--cf-danger": "#dc2626",
    "--cf-danger-soft": "rgba(220,38,38,0.10)",
    "--cf-on-accent": "#ffffff",
  },
};

export function applyTheme(el: HTMLElement, theme: ThemeName) {
  const vars = palettes[theme];
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value);
  }
}
