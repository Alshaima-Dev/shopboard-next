"use client";

import { useTheme } from "./theme-provider";
import type { ThemePreference } from "./theme-store";
import { useLocalization } from "../i18n/language-provider";

const nextTheme: Record<ThemePreference, ThemePreference> = { system: "light", light: "dark", dark: "system" };

export function ThemeToggle() {
  const { preference, resolved, setPreference } = useTheme();
  const { t } = useLocalization();
  const next = nextTheme[preference];
  const label = t("themeToggle", { current: t(`theme${preference[0].toUpperCase()}${preference.slice(1)}`), next: t(`theme${next[0].toUpperCase()}${next.slice(1)}`) });
  return <button id="theme-toggle" type="button" data-theme-preference={preference} data-resolved-theme={resolved}
    aria-label={label} title={label} onClick={() => setPreference(next)}
    className="grid size-touch-target shrink-0 cursor-pointer place-items-center rounded-control border border-coffee bg-background text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
    {preference === "system" ? (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
    ) : preference === "dark" ? (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></svg>
    ) : (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
    )}
  </button>;
}
