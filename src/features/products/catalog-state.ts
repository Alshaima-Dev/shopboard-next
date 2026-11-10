export interface CatalogControls {
  query: string;
  category: string;
  sort: string;
  affordableOnly: boolean;
}

export type CatalogAction =
  | { type: "query"; value: string }
  | { type: "category"; value: string }
  | { type: "sort"; value: string }
  | { type: "mode"; affordableOnly: boolean };

export function createCatalogControls(): CatalogControls {
  return { query: "", category: "", sort: "featured", affordableOnly: false };
}

// Preserve the original reducer's independent controls and mode reset semantics.
export function catalogControlsReducer(state: CatalogControls, action: CatalogAction): CatalogControls {
  switch (action.type) {
    case "query":
      return { ...state, query: action.value };
    case "category":
      return { ...state, category: action.value };
    case "sort":
      return { ...state, sort: action.value };
    case "mode":
      return { ...createCatalogControls(), affordableOnly: action.affordableOnly };
  }
}
