import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { createElement } from "react";
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
const { Card } = loadComponent("../src/components/ui/card.tsx");

test("Card preserves native semantics, children, accessible names and React 19 refs", () => {
  const ref = { current: null };
  const onClick = () => {};
  const child = createElement("h2", { id: "panel-title" }, "Details");
  const element = Card({ as: "section", id: "panel", "aria-labelledby": "panel-title", dir: "rtl", lang: "ar", ref, onClick, children: child });
  assert.equal(element.type, "section");
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.children, child);
  const html = renderToStaticMarkup(element);
  for (const attribute of ['id="panel"', 'aria-labelledby="panel-title"', 'dir="rtl"', 'lang="ar"']) assert.ok(html.includes(attribute));
  assert.ok(html.includes('<h2 id="panel-title">Details</h2>'));
  const neutral = Card({ children: "Content" });
  assert.equal(neutral.type, "div");
  assert.equal(neutral.props.role, undefined);
  assert.equal(neutral.props.tabIndex, undefined);
  assert.match(neutral.props.className, /focus-visible:outline-ring/);
  for (const as of ["div", "section", "article", "aside"]) assert.equal(Card({ as }).type, as);
});

test("all Card variants and padding options render without leaking visual props", () => {
  const variants = new Set();
  for (const variant of ["default", "soft", "outline"]) {
    variants.add(Card({ variant }).props.className);
    const paddings = new Set();
    for (const padding of ["none", "sm", "md", "lg", "responsive"]) {
      const element = Card({ variant, padding, className: "my-5", "data-panel": "example" });
      const html = renderToStaticMarkup(element);
      for (const prop of ["as", "variant", "padding"]) assert.equal(element.props[prop], undefined);
      assert.ok(element.props.className.endsWith("my-5"));
      assert.ok(html.includes('data-panel="example"'));
      assert.ok(!html.includes("undefined"));
      paddings.add(element.props.className);
    }
    assert.equal(paddings.size, 5);
  }
  assert.equal(variants.size, 3);
});

test("Shipping reuses Card while preserving its information sections and labelled aside", () => {
  const { ShippingInformation } = loadComponent("../src/features/shipping/shipping-information.tsx", name => {
    if (name === "@/components/ui/card") return { Card };
    if (name === "@/features/i18n/language-provider") return { RouteText: ({ name }) => name };
    if (name === "next/link") return { default: ({ children, ...props }) => createElement("a", props, children) };
    return require(name);
  });
  const root = ShippingInformation().props.children;
  const cards = root.props.children[1].props.children;
  for (const card of cards) {
    assert.equal(card.type, Card);
    assert.equal(card.props.as, "section");
    assert.equal(card.props.variant, "soft");
    assert.equal(card.props.padding, "responsive");
  }
  const note = root.props.children[2];
  assert.equal(note.type, Card);
  assert.equal(note.props.as, "aside");
  assert.equal(note.props.variant, "outline");
  assert.equal(note.props["aria-labelledby"], "shipping-availability");
  assert.ok(renderToStaticMarkup(ShippingInformation()).includes('href="/shop"'));
});

test("CardProps accepts HTMLElement events/refs and rejects invalid tags, variants and native props", () => {
  const fixturePath = path.resolve("tests/card-type-fixture.tsx");
  const fixture = `import type { CardProps } from "../src/components/ui/card";
export const valid: CardProps = { as: "article", variant: "soft", padding: "responsive", id: "details", "aria-label": "Details", tabIndex: -1, onClick: event => { event.currentTarget.focus(); }, ref: element => { if (element) element.focus(); }, children: "Content" };
export const badTag: CardProps = { as: "button" };
export const badVariant: CardProps = { variant: "ghost" };
export const badPadding: CardProps = { padding: "xl" };
export const badHref: CardProps = { href: "/shop" };
export const badDisabled: CardProps = { disabled: true };`;
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
