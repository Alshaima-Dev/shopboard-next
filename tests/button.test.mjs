import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const buttonPath = new URL("../src/components/ui/button.tsx", import.meta.url);
const compiled = ts.transpileModule(readFileSync(buttonPath, "utf8"), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
});
const componentExports = {};
new Function("require", "exports", compiled.outputText)(require, componentExports);
const { Button } = componentExports;

test("Button defaults to a native non-submit control and forwards accessible attributes", () => {
  const element = Button({ children: "Save <changes>", id: "save", name: "action", value: "save", "aria-label": "Save changes", "aria-describedby": "help", dir: "rtl", tabIndex: 0 });
  assert.equal(element.type, "button");
  assert.equal(element.props.type, "button");
  const html = renderToStaticMarkup(element);
  for (const attribute of ['id="save"', 'name="action"', 'value="save"', 'aria-label="Save changes"', 'aria-describedby="help"', 'dir="rtl"', 'tabindex="0"']) assert.ok(html.includes(attribute), attribute);
  assert.ok(html.includes("Save &lt;changes&gt;"));
  assert.match(element.props.className, /focus-visible:outline-ring/);
});

test("all four variants and three sizes render without leaking styling props to HTML", () => {
  const variantStyles = new Set();
  for (const variant of ["primary", "secondary", "outline", "danger"]) {
    variantStyles.add(Button({ variant }).props.className);
    const sizes = new Set();
    for (const size of ["sm", "md", "lg"]) {
      const element = Button({ variant, size, children: "Action", className: "w-full" });
      const html = renderToStaticMarkup(element);
      assert.equal(element.props.variant, undefined);
      assert.equal(element.props.size, undefined);
      assert.ok(!html.includes("undefined"));
      assert.ok(!html.includes('variant="'));
      assert.ok(!html.includes('size="'));
      assert.ok(element.props.className.endsWith("w-full"));
      sizes.add(element.props.className);
    }
    assert.equal(sizes.size, 3);
  }
  assert.equal(variantStyles.size, 4);
});

test("native disabled, form types, event handlers and React refs are preserved", () => {
  const ref = { current: null };
  const onClick = () => {};
  const onKeyDown = () => {};
  const element = Button({ type: "submit", disabled: true, form: "checkout", formNoValidate: true, onClick, onKeyDown, ref, children: "Submit" });
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.onKeyDown, onKeyDown);
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.disabled, true);
  const html = renderToStaticMarkup(element);
  assert.ok(html.includes('disabled=""'));
  assert.ok(html.includes('type="submit"'));
  assert.ok(html.includes('form="checkout"'));
  assert.ok(html.includes('formNoValidate=""'));
  assert.match(element.props.className, /disabled:opacity-45/);
  assert.equal(Button({ type: "reset" }).props.type, "reset");
});

test("ButtonProps accepts native events/refs and rejects invalid variants, sizes and attributes", () => {
  const fixturePath = path.resolve("tests/button-type-fixture.tsx");
  const fixture = `import type { ButtonProps } from "../src/components/ui/button";
export const valid: ButtonProps = { variant: "outline", size: "sm", type: "submit", disabled: true, "aria-label": "Save", onClick: event => { event.currentTarget.disabled = true; }, ref: element => { if (element) element.focus(); } };
export const badVariant: ButtonProps = { variant: "ghost" };
export const badSize: ButtonProps = { size: "xl" };
export const badType: ButtonProps = { type: "link" };
export const badAttribute: ButtonProps = { href: "/shop" };`;
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
  const program = ts.createProgram([fixturePath], { ...options, incremental: false }, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(diagnostics.length, 4, diagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, " ")).join("\n"));
  const message = diagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, " ")).join("\n");
  for (const rejected of ["ghost", "xl", "link", "href"]) assert.ok(message.includes(rejected), message);
});
