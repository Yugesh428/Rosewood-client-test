"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThemeData {
  id:            string;
  name:          string;
  isDefault:     boolean;
  primary:       string;
  primaryLight:  string;
  primaryDark:   string;
  primaryText:   string;
  bgPage:        string;
  bgCard:        string;
  bgNav:         string;
  textHeading:   string;
  textBody:      string;
  textMuted:     string;
  borderColor:   string;
  shadow:        string;
  shadowHover:   string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme:     ThemeData | null;
  loading:   boolean;
  setTheme:  (themeId: string) => Promise<void>;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:    null,
  loading:  true,
  setTheme: async () => {},
  refreshTheme: async () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── Apply CSS variables helper ───────────────────────────────────────────────

function applyTheme(t: ThemeData) {
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
  root.setAttribute("data-theme", t.id);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,   setThemeData] = useState<ThemeData | null>(null);
  const [loading, setLoading]   = useState(true);

  const refreshTheme = useCallback(async () => {
    try {
      console.log("Fetching active theme from API...");
      const res = await fetch("/api/site-theme");
      const json = await res.json();
      console.log("Theme API response:", json);
      if (json.success && json.data?.activeTheme) {
        console.log("Setting active theme:", json.data.activeTheme);
        setThemeData(json.data.activeTheme);
        applyTheme(json.data.activeTheme);
      }
    } catch (err) {
      console.error("Failed to fetch theme:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch active theme from DB on mount
  useEffect(() => {
    refreshTheme();
  }, [refreshTheme]);

  // Persist + broadcast to DB
  const setTheme = useCallback(async (themeId: string) => {
    try {
      console.log("Setting theme to:", themeId);
      const res = await fetch("/api/site-theme", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ activeThemeId: themeId }),
      });
      const json = await res.json();
      console.log("Set theme API response:", json);
      if (json.success) {
        await refreshTheme();
      } else {
        throw new Error(json.message || "Failed to set theme");
      }
    } catch (err) {
      console.error("Failed to set theme:", err);
      throw err;
    }
  }, [refreshTheme]);

  return (
    <ThemeContext.Provider value={{ theme, loading, setTheme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
