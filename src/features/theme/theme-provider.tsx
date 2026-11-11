"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createThemeController } from "./theme-store";
import { applyDocumentTheme } from "./theme-document";

const ThemeContext = createContext<ReturnType<typeof createThemeController> | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(createThemeController);
  useEffect(() => {
    controller.restore();
    return controller.destroy;
  }, [controller]);
  return <ThemeContext.Provider value={controller}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const controller = useContext(ThemeContext);
  if (!controller) throw new Error("Theme UI requires ThemeProvider");
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  return {
    ...snapshot,
    setPreference(value: unknown) {
      controller.setPreference(value);
      applyDocumentTheme(document.documentElement, controller.getSnapshot());
    },
  };
}
