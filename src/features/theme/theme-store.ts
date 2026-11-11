export const themeStorageKey = "shopboard-theme";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";
export interface ThemeSnapshot { preference: ThemePreference; resolved: ResolvedTheme }
type StorageAdapter = Pick<Storage, "getItem" | "setItem">;
export interface ThemeMediaQuery {
  matches: boolean;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
}

export function getThemePreference(value: unknown): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

function resolveTheme(preference: ThemePreference, media: ThemeMediaQuery | null): ResolvedTheme {
  return preference === "system" ? media?.matches ? "dark" : "light" : preference;
}

export function createThemeController() {
  let storage: StorageAdapter | null = null;
  let media: ThemeMediaQuery | null = null;
  let restored = false;
  let listening = false;
  let snapshot: ThemeSnapshot = Object.freeze({ preference: "system", resolved: "light" });
  const listeners = new Set<() => void>();
  const publish = (preference: ThemePreference) => {
    const next = Object.freeze({ preference, resolved: resolveTheme(preference, media) });
    if (next.preference === snapshot.preference && next.resolved === snapshot.resolved) return;
    snapshot = next;
    for (const listener of listeners) listener();
  };
  const systemChanged = () => {
    if (snapshot.preference === "system") publish("system");
  };
  const listen = () => {
    if (media && !listening) {
      media.addEventListener("change", systemChanged);
      listening = true;
    }
  };
  function restore(nextStorage?: StorageAdapter | null, nextMedia?: ThemeMediaQuery | null) {
    if (restored) {
      listen();
      return;
    }
    restored = true;
    try { storage = nextStorage === undefined ? globalThis.localStorage : nextStorage; } catch { storage = null; }
    media = nextMedia === undefined ? globalThis.matchMedia?.("(prefers-color-scheme: dark)") ?? null : nextMedia;
    listen();
    let preference: ThemePreference = "system";
    try { preference = getThemePreference(storage?.getItem(themeStorageKey)); } catch { /* Keep system preference. */ }
    publish(preference);
  }
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: (): ThemeSnapshot => serverThemeSnapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    restore,
    setPreference(value: unknown) {
      if (!restored) restore();
      const preference = getThemePreference(value);
      try { storage?.setItem(themeStorageKey, preference); } catch { /* Keep the in-memory choice. */ }
      publish(preference);
    },
    destroy() {
      if (media && listening) media.removeEventListener("change", systemChanged);
      listening = false;
    },
  };
}

const serverThemeSnapshot: ThemeSnapshot = Object.freeze({ preference: "system", resolved: "light" });
