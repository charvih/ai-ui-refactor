"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "ai-ui-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isReady, setIsReady] = useState(false);

  // Sync the initial theme after hydration so we can respect localStorage.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = (
      typeof window !== "undefined"
        ? localStorage.getItem(THEME_STORAGE_KEY)
        : null
    ) as Theme | null;

    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      setIsReady(true);
      return;
    }

    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    setTheme(prefersDark ? "dark" : "light");
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, isReady]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme, isReady };
}
