import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createThemeController, getThemePreference, themeStorageKey } from "../src/features/theme/theme-store.ts";
import { applyDocumentTheme } from "../src/features/theme/theme-document.ts";
import { themeInitializationScript } from "../src/features/theme/theme-script.ts";

test("theme controller restores and persists light, dark, and system preferences safely", () => {
  const saved = new Map([[themeStorageKey, "dark"], ["shopboard-language", "ar"]]);
  const storage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  const listeners = new Set();
  const media = { matches: false, addEventListener: (_, listener) => listeners.add(listener), removeEventListener: (_, listener) => listeners.delete(listener) };
  const controller = createThemeController();
  assert.deepEqual(controller.getServerSnapshot(), { preference: "system", resolved: "light" });
  controller.restore(storage, media);
  assert.deepEqual(controller.getSnapshot(), { preference: "dark", resolved: "dark" });
  for (const preference of ["light", "dark", "system"]) {
    controller.setPreference(preference);
    assert.equal(controller.getSnapshot().preference, preference);
    assert.equal(saved.get(themeStorageKey), preference);
  }
  assert.equal(saved.get("shopboard-language"), "ar");
  controller.setPreference("unsupported");
  assert.equal(controller.getSnapshot().preference, "system");
  assert.equal(listeners.size, 1);
  controller.destroy();
  assert.equal(listeners.size, 0);
  controller.restore(storage, media);
  assert.equal(listeners.size, 1, "Strict Mode effect setup must reattach the media listener");
  for (const value of [null, "", "SYSTEM", "constructor", "unsupported"]) assert.equal(getThemePreference(value), "system");
});

test("system preference follows media changes while explicit choices remain stable", () => {
  const listeners = new Set();
  const media = { matches: false, addEventListener: (_, listener) => listeners.add(listener), removeEventListener: (_, listener) => listeners.delete(listener) };
  const controller = createThemeController();
  controller.restore(null, media);
  assert.deepEqual(controller.getSnapshot(), { preference: "system", resolved: "light" });
  media.matches = true;
  for (const listener of listeners) listener();
  assert.deepEqual(controller.getSnapshot(), { preference: "system", resolved: "dark" });
  controller.setPreference("light");
  media.matches = false;
  for (const listener of listeners) listener();
  assert.deepEqual(controller.getSnapshot(), { preference: "light", resolved: "light" });
});

test("blocked storage retains in-memory theme selection", () => {
  const storage = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } };
  const controller = createThemeController();
  controller.restore(storage, null);
  controller.setPreference("dark");
  assert.deepEqual(controller.getSnapshot(), { preference: "dark", resolved: "dark" });
});

test("document theme application preserves CSS-driven system color scheme", () => {
  const root = { dataset: {}, style: { colorScheme: "dark" } };
  applyDocumentTheme(root, { preference: "system", resolved: "light" });
  assert.equal(root.dataset.theme, "system");
  assert.equal(root.style.colorScheme, "");
  applyDocumentTheme(root, { preference: "dark", resolved: "dark" });
  assert.equal(root.dataset.theme, "dark");
  assert.equal(root.style.colorScheme, "dark");
});

test("initialization script applies saved or system theme before hydration without throwing", () => {
  function initialize(saved, dark) {
    const root = { dataset: {}, style: {} };
    Function("localStorage", "matchMedia", "document", themeInitializationScript)(
      { getItem: () => saved }, () => ({ matches: dark }), { documentElement: root },
    );
    return root;
  }
  assert.deepEqual(initialize("dark", false), { dataset: { theme: "dark" }, style: { colorScheme: "dark" } });
  assert.deepEqual(initialize("light", true), { dataset: { theme: "light" }, style: { colorScheme: "light" } });
  assert.deepEqual(initialize(null, true), { dataset: { theme: "system" }, style: { colorScheme: "" } });
  assert.doesNotThrow(() => Function("localStorage", "matchMedia", "document", themeInitializationScript)(
    { getItem() { throw Error("blocked"); } }, () => ({ matches: false }), { documentElement: {} },
  ));
});

test("theme toggle cycles all preferences with localized accessible state", () => {
  const require = createRequire(import.meta.url);
  const ts = require("typescript");
  let preference = "system";
  let selected;
  const compiled = ts.transpileModule(readFileSync(new URL("../src/features/theme/theme-toggle.tsx", import.meta.url), "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  new Function("require", "exports", compiled.outputText)(name => {
    if (name === "./theme-provider") return { useTheme: () => ({ preference, resolved: preference === "dark" ? "dark" : "light", setPreference: value => { selected = value; } }) };
    if (name === "../i18n/language-provider") return { useLocalization: () => ({ t: (key, values) => values ? `Tema: ${values.current}; ${values.next}` : key }) };
    return require(name);
  }, exports);
  for (const [current, next] of [["system", "light"], ["light", "dark"], ["dark", "system"]]) {
    preference = current;
    const button = exports.ThemeToggle();
    assert.equal(button.type, "button");
    assert.equal(button.props.id, "theme-toggle");
    assert.equal(button.props.type, "button");
    assert.equal(button.props["data-theme-preference"], current);
    assert.equal(button.props.title, button.props["aria-label"]);
    assert.match(button.props["aria-label"], /Tema:/);
    button.props.onClick();
    assert.equal(selected, next);
  }
});

test("semantic theme tokens cover shared surfaces and retain one source CSS file", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  for (const token of ["background", "foreground", "primary", "primary-foreground", "accent", "muted-foreground", "soft", "border", "control-border", "ring", "danger", "overlay", "image-outline"]) {
    assert.ok(css.includes(`--theme-${token}:`), token);
  }
  assert.ok(css.includes(':root[data-theme="dark"]'));
  assert.ok(css.includes("@media (prefers-color-scheme: dark)"));
});
