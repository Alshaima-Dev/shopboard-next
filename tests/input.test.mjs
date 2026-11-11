import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const compiled = ts.transpileModule(readFileSync(new URL("../src/components/ui/input.tsx", import.meta.url), "utf8"), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
});
const componentExports = {};
new Function("require", "exports", compiled.outputText)(require, componentExports);
const { Input } = componentExports;

test("Input forwards native constraints, accessible labels, direction and numeric size", () => {
  const element = Input({ id: "email", name: "email", type: "email", required: true, minLength: 3, maxLength: 254, pattern: ".+@.+", autoComplete: "email", placeholder: "Your email", "aria-label": "Email", "aria-describedby": "email-help", dir: "ltr", size: 30 });
  assert.equal(element.type, "input");
  const html = renderToStaticMarkup(element);
  for (const attribute of ['id="email"', 'name="email"', 'type="email"', 'required=""', 'minLength="3"', 'maxLength="254"', 'pattern=".+@.+"', 'autoComplete="email"', 'aria-label="Email"', 'aria-describedby="email-help"', 'dir="ltr"', 'size="30"']) assert.ok(html.includes(attribute), attribute);
  assert.match(element.props.className, /focus-visible:outline-ring/);
  assert.equal(element.props["aria-invalid"], undefined);
});

test("Input variants and visual sizes stay separate from native attributes and invalid semantics", () => {
  const variants = new Set();
  for (const variant of ["default", "outline"]) {
    variants.add(Input({ variant }).props.className);
    const sizes = new Set();
    for (const controlSize of ["sm", "md", "lg"]) {
      const element = Input({ variant, controlSize, invalid: true, className: "max-w-sm", dir: "rtl" });
      const html = renderToStaticMarkup(element);
      assert.ok(html.includes('aria-invalid="true"'));
      for (const prop of ["variant", "controlSize", "invalid"]) assert.equal(element.props[prop], undefined);
      assert.ok(!html.includes("undefined"));
      assert.match(element.props.className, /aria-invalid:border-primary/);
      assert.ok(element.props.className.endsWith("max-w-sm"));
      sizes.add(element.props.className);
    }
    assert.equal(sizes.size, 3);
  }
  assert.equal(variants.size, 2);
  for (const ariaInvalid of [false, true, "grammar", "spelling"]) {
    assert.equal(Input({ "aria-invalid": ariaInvalid }).props["aria-invalid"], ariaInvalid);
    assert.equal(Input({ invalid: false, "aria-invalid": ariaInvalid }).props["aria-invalid"], ariaInvalid);
  }
  assert.equal(Input({ invalid: true, "aria-invalid": false }).props["aria-invalid"], true);
});

test("Input preserves RHF-style handlers, React refs, controlled values and native disabled state", () => {
  const onChange = () => {};
  const onBlur = () => {};
  const ref = () => {};
  const registration = { name: "fullName", onChange, onBlur, ref };
  const element = Input({ ...registration, value: "Demo Visitor", disabled: true, readOnly: true });
  assert.equal(element.props.onChange, onChange);
  assert.equal(element.props.onBlur, onBlur);
  assert.equal(element.props.ref, ref);
  assert.equal(element.props.name, "fullName");
  assert.equal(element.props.value, "Demo Visitor");
  const html = renderToStaticMarkup(element);
  for (const attribute of ['value="Demo Visitor"', 'disabled=""', 'readOnly=""']) assert.ok(html.includes(attribute));
  assert.match(element.props.className, /disabled:opacity-50/);
  const uncontrolled = Input({ defaultValue: "Saved value" });
  assert.equal(uncontrolled.props.value, undefined);
  assert.equal(uncontrolled.props.defaultValue, "Saved value");
});

test("InputProps accepts native values/events/refs and rejects invalid styling props", () => {
  const fixturePath = path.resolve("tests/input-type-fixture.tsx");
  const fixture = `import type { InputProps } from "../src/components/ui/input";
export const valid: InputProps = { variant: "outline", controlSize: "sm", size: 30, invalid: true, required: true, "aria-invalid": "grammar", onChange: event => { event.currentTarget.value = "updated"; }, ref: element => { if (element) element.focus(); } };
export const badVariant: InputProps = { variant: "filled" };
export const badControlSize: InputProps = { controlSize: "xl" };
export const badInvalid: InputProps = { invalid: "yes" };
export const badNativeSize: InputProps = { size: "sm" };
export const badAttribute: InputProps = { rows: 3 };
export const badChildren: InputProps = { children: "text" };`;
  const config = ts.readConfigFile(path.resolve("tsconfig.json"), ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  host.readFile = file => path.resolve(file) === fixturePath ? fixture : readFile(file);
  host.fileExists = file => path.resolve(file) === fixturePath || fileExists(file);
  host.getSourceFile = (file, languageVersion) => {
    const source = host.readFile(file);
    return source === undefined ? undefined : ts.createSourceFile(file, source, languageVersion, true);
  };
  const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([fixturePath], { ...options, incremental: false }, host));
  const messages = diagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, " ")).join("\n");
  assert.equal(diagnostics.length, 6, messages);
  assert.deepEqual(diagnostics.map(item => item.file.getLineAndCharacterOfPosition(item.start).line + 1), [3, 4, 5, 6, 7, 8]);
  for (const rejected of ["filled", "xl", "boolean", "number", "rows", "children"]) assert.ok(messages.includes(rejected), messages);
});
