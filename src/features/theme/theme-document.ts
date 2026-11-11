import type { ThemeSnapshot } from "./theme-store";

export function applyDocumentTheme(root: HTMLElement, theme: ThemeSnapshot): void {
  root.dataset.theme = theme.preference;
  root.style.colorScheme = theme.preference === "system" ? "" : theme.resolved;
}
