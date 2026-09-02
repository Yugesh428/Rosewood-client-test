"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";
import { themes, DEFAULT_THEME, type ThemeKey, type Theme } from "@/lib/theme";

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme:     Theme;
  themeKey:  ThemeKey;
  loading:   boolean;
  setTheme:  (key: ThemeKey) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:    themes[DEFAULT_THEME],
  themeKey: DEFAULT_THEME,
  loading:  true,
  setTheme: async () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── Apply CSS variables helper ───────────────────────────────────────────────

function applyTheme(key: ThemeKey) {
  const t    = themes[key];
  const root = document.documentElement;
  root.style.setProperty("--color-primary",       t.primary);
  root.style.setProperty("--color-primary-light",  t.primaryLight);
  root.style.setProperty("--color-primary-dark",   t.primaryDark);
  root.style.setProperty("--color-primary-text",   t.primaryText);
  root.style.setProperty("--color-bg-page",        t.bgPage);
  root.style.setProperty("--color-bg-card",        t.bgCard);
  root.style.setProperty("--color-bg-nav",         t.bgNav);
  root.style.setProperty("--color-text-heading",   t.textHeading);
  root.style.setProperty("--color-text-body",      t.textBody);
  root.style.setProperty("--color-text-muted",     t.textMuted);
  root.style.setProperty("--color-border",         t.borderColor);
  root.setAttribute("data-theme", key);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>(DEFAULT_THEME);
  const [loading,  setLoading]  = useState(true);

  // Fetch active theme from DB on mount
  useEffect(() => {
    fetch("/api/site-theme")
      .then(r => r.json())
      .then(json => {
        const key: ThemeKey = json.success ? json.data?.activeTheme ?? DEFAULT_THEME : DEFAULT_THEME;
        setThemeKey(key);
        applyTheme(key);
      })
      .catch(() => applyTheme(DEFAULT_THEME))
      .finally(() => setLoading(false));
  }, []);

  // Persist + broadcast to DB
  const setTheme = useCallback(async (key: ThemeKey) => {
    setThemeKey(key);
    applyTheme(key);
    await fetch("/api/site-theme", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ activeTheme: key }),
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: themes[themeKey], themeKey, loading, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
