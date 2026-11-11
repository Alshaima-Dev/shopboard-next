import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function loadComponent(relativePath, componentRequire = require) {
  const compiled = ts.transpileModule(readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  });
  const componentExports = {};
  new Function("require", "exports", compiled.outputText)(componentRequire, componentExports);
  return componentExports;
}
const { Badge } = loadComponent("../src/components/ui/badge.tsx");

test("Badge preserves native attributes, localized children and refs without invented semantics", () => {
  const ref = { current: null };
  const element = Badge({ id: "quantity", lang: "ar", dir: "rtl", "aria-label": "Quantity", ref, children: "١٢" });
  assert.equal(element.type, "span");
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.role, undefined);
  assert.equal(element.props["aria-live"], undefined);
  assert.equal(element.props.tabIndex, undefined);
  const html = renderToStaticMarkup(element);
  for (const attribute of ['id="quantity"', 'lang="ar"', 'dir="rtl"', 'aria-label="Quantity"']) assert.ok(html.includes(attribute));
  assert.ok(html.includes("١٢"));
  const isolated = Badge({ as: "bdi", dir: "auto", title: "Count", children: 12 });
  assert.equal(isolated.type, "bdi");
  assert.ok(renderToStaticMarkup(isolated).includes('dir="auto"'));
});

test("all Badge variants and sizes render without leaking visual props", () => {
  const variants = new Set();
  for (const variant of ["default", "soft", "outline"]) {
    variants.add(Badge({ variant }).props.className);
    const sizes = new Set();
    for (const size of ["sm", "md", "count"]) {
      const element = Badge({ variant, size, "data-label": "example", className: "ms-2", children: "Label" });
      for (const prop of ["as", "variant", "size"]) assert.equal(element.props[prop], undefined);
      assert.ok(element.props.className.endsWith("ms-2"));
      const html = renderToStaticMarkup(element);
      assert.ok(html.includes('data-label="example"'));
      assert.ok(!html.includes("undefined"));
      sizes.add(element.props.className);
    }
    assert.equal(sizes.size, 3);
  }
  assert.equal(variants.size, 3);
});

test("CartButton uses Badge without changing the localized count, accessible name or action", () => {
  let opened = 0;
  const open = () => { opened++; };
  const number = value => new Intl.NumberFormat("ar").format(value);
  const { CartButton } = loadComponent("../src/features/cart/cart-controls.tsx", name => {
    if (name === "@/components/ui/badge") return { Badge };
    if (name === "./cart-context") return { useCart: () => ({ count: 12, ready: true, open }) };
    if (name === "../i18n/language-provider") return { useLocalization: () => ({ number, t: (key, values) => key === "openBag" ? `Open bag ${values.count}` : "Bag" }) };
    return require(name);
  });
  const element = CartButton();
  const badge = element.props.children[2];
  assert.equal(badge.type, Badge);
  assert.equal(badge.props.id, "count");
  assert.equal(badge.props.variant, "soft");
  assert.equal(badge.props.size, "count");
  assert.equal(badge.props.children, number(12));
  assert.equal(element.props["aria-label"], `Open bag ${number(12)}`);
  assert.equal(element.props.type, "button");
  assert.equal(element.props.onClick, open);
  element.props.onClick();
  assert.equal(opened, 1);
  assert.ok(renderToStaticMarkup(element).includes('id="count"'));
});

test("BadgeProps accepts inline semantics/events/refs and rejects invalid visual/native props", () => {
  const fixturePath = path.resolve("tests/badge-type-fixture.tsx");
  const fixture = `import type { BadgeProps } from "../src/components/ui/badge";
export const valid: BadgeProps = { as: "bdi", variant: "soft", size: "count", dir: "auto", "aria-label": "Count", children: 12, onClick: event => { event.currentTarget.focus(); }, ref: element => { if (element) element.focus(); } };
export const badTag: BadgeProps = { as: "button" };
export const badVariant: BadgeProps = { variant: "warning" };
export const badSize: BadgeProps = { size: "xl" };
export const badHref: BadgeProps = { href: "/shop" };
export const badDisabled: BadgeProps = { disabled: true };`;
  const config = ts.readConfigFile(path.resolve("tsconfig.json"), ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  host.readFile = file => path.resolve(file) === fixturePath ? fixture : readFile(file);
  host.fileExists = file => path.resolve(file) === fixturePath || fileExists(file);
  host.getSourceFile = (file, languageVersion) => {
    const text = host.readFile(file);
    return text === undefined ? undefined : ts.createSourceFile(file, text, languageVersion, true);
  };
  const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([fixturePath], { ...options, incremental: false }, host));
  assert.equal(diagnostics.length, 5, diagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, " ")).join("\n"));
  assert.deepEqual(diagnostics.map(item => item.file.getLineAndCharacterOfPosition(item.start).line + 1), [3, 4, 5, 6, 7]);
});
