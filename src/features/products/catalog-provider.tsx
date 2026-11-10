"use client";

import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { catalogControlsReducer, createCatalogControls } from "./catalog-state";
import type { CatalogAction, CatalogControls } from "./catalog-state";

const CatalogContext = createContext<{
  state: CatalogControls;
  dispatch: Dispatch<CatalogAction>;
} | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(catalogControlsReducer, undefined, createCatalogControls);
  return <CatalogContext.Provider value={{ state, dispatch }}>{children}</CatalogContext.Provider>;
}

export function useCatalogControls() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("Catalog controls require CatalogProvider");
  return context;
}
