import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function load(relativePath, componentRequire) {
  const compiled = ts.transpileModule(readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  new Function("require", "exports", compiled.outputText)(componentRequire, exports);
  return exports;
}
function harness(props = {}) {
  const effects = [];
  const changes = [];
  const { Modal } = load("../src/components/ui/modal.tsx", name => name === "react" ? {
    useRef: value => ({ current: value }), useCallback: callback => callback,
    useEffect: effect => effects.push(effect),
  } : require(name));
  return { element: Modal({ open: true, onOpenChange: value => changes.push(value), "aria-labelledby": "title", ...props }), effects, changes, Modal };
}
function event(extra = {}) {
  return { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...extra };
}

test("Modal forwards native attributes and React 19 object/callback refs without rendering the open attribute", () => {
  const ref = { current: null };
  const { element } = harness({ ref, id: "dialog", lang: "ar", dir: "rtl", "aria-describedby": "description", children: "Content" });
  assert.equal(element.type, "dialog");
  for (const [key, value] of Object.entries({ id: "dialog", lang: "ar", dir: "rtl", "aria-describedby": "description", children: "Content" })) assert.equal(element.props[key], value);
  for (const key of ["open", "onOpenChange", "size", "closeOnBackdropClick", "restoreFocusTo"]) assert.equal(element.props[key], undefined);
  const node = {};
  element.props.ref(node);
  assert.equal(ref.current, node);
  element.props.ref(null);
  assert.equal(ref.current, null);
  let cleaned = false;
  const callback = harness({ ref: value => { assert.equal(value, node); return () => { cleaned = true; }; } });
  callback.element.props.ref(node)();
  assert.equal(cleaned, true);
  const sizes = new Set(["sm", "md", "lg", "drawer"].map(size => harness({ size }).element.props.className));
  assert.equal(sizes.size, 4);
});

test("Modal uses showModal once, closes on controlled cleanup, and restores connected focus", () => {
  class FocusTarget { isConnected = true; focused = 0; focus() { this.focused++; } }
  const opener = new FocusTarget();
  const persistent = new FocusTarget();
  const oldDocument = globalThis.document;
  const oldHTMLElement = globalThis.HTMLElement;
  globalThis.HTMLElement = FocusTarget;
  globalThis.document = { activeElement: opener, querySelector: selector => selector === "#opener" ? persistent : null };
  try {
    for (const restoreFocusTo of [undefined, "#opener", "#missing"]) {
      const { element, effects } = harness({ restoreFocusTo });
      const node = { open: false, shows: 0, closes: 0, showModal() { this.open = true; this.shows++; }, close() { this.open = false; this.closes++; } };
      element.props.ref(node);
      const cleanup = effects[0]();
      assert.equal(node.shows, 1);
      cleanup();
      assert.equal(node.open, false);
      assert.equal(node.closes, 1);
    }
    assert.equal(opener.focused, 2);
    assert.equal(persistent.focused, 1);
    const closed = harness({ open: false });
    closed.element.props.ref({ showModal() { assert.fail("Closed Modal must not open"); } });
    assert.equal(closed.effects[0](), undefined);
    const alreadyOpen = harness();
    alreadyOpen.element.props.ref({ open: true, showModal() { assert.fail("Do not repeat showModal"); } });
    alreadyOpen.effects[0]();
  } finally {
    globalThis.document = oldDocument;
    globalThis.HTMLElement = oldHTMLElement;
  }
});

test("Escape, native close and backdrop request controlled closing while respecting native handlers", () => {
  const { element, changes } = harness();
  const cancel = event();
  element.props.onCancel(cancel);
  assert.equal(cancel.defaultPrevented, true);
  element.props.onClose(event({ currentTarget: { open: false } }));
  element.props.onClose(event({ currentTarget: { open: true } }));
  const target = { getBoundingClientRect: () => ({ left: 10, right: 100, top: 10, bottom: 100 }) };
  element.props.onClick(event({ target, currentTarget: target, clientX: 5, clientY: 50 }));
  element.props.onClick(event({ target, currentTarget: target, clientX: 50, clientY: 50 }));
  element.props.onClick(event({ target: {}, currentTarget: target, clientX: 5, clientY: 50 }));
  assert.deepEqual(changes, [false, false, false]);
  const prevented = harness({ onCancel: e => e.preventDefault(), onClick: e => e.preventDefault() });
  prevented.element.props.onCancel(event());
  prevented.element.props.onClick(event({ target, currentTarget: target, clientX: 5 }));
  assert.deepEqual(prevented.changes, []);
  const noBackdrop = harness({ closeOnBackdropClick: false });
  noBackdrop.element.props.onClick(event({ target, currentTarget: target, clientX: 5 }));
  assert.deepEqual(noBackdrop.changes, []);
});

test("CartDialog delegates native modal state to Modal and retains its confirmation focus handling", () => {
  let closed = 0;
  const { Modal } = harness();
  const cart = { isOpen: true, items: [], close: () => { closed++; } };
  const { CartDialog } = load("../src/features/cart/cart-dialog.tsx", name => {
    if (name === "react") return { useRef: value => ({ current: value }), useLayoutEffect: () => {} };
    if (name === "@/components/ui/modal") return { Modal };
    if (name === "./cart-context") return { useCart: () => cart };
    if (name === "../i18n/language-provider") return { useLocalization: () => ({ t: key => key, money: value => value }) };
    if (name === "@/components/ui/button") return { Button: "button" };
    if (name === "./cart-item") return { CartItem: "article" };
    if (name === "next/link") return { default: "a" };
    return require(name);
  });
  const element = CartDialog();
  assert.equal(element.type, Modal);
  assert.equal(element.props.open, true);
  assert.equal(element.props.size, "drawer");
  assert.equal(element.props.restoreFocusTo, "#open-cart");
  assert.equal(element.props["aria-labelledby"], "cart-title");
  assert.equal(typeof element.props.onClickCapture, "function");
  element.props.onOpenChange(false);
  assert.equal(closed, 1);
  assert.equal(element.props.onCancel, undefined);
  assert.equal(element.props.onClose, undefined);
});

test("ModalProps requires controlled state and a label, and strictly types native refs and sizes", () => {
  const fixturePath = path.resolve("tests/modal-type-fixture.tsx");
  const fixture = `import type { ModalProps } from "../src/components/ui/modal";
export const valid: ModalProps = { open: true, onOpenChange: open => { console.log(open); }, "aria-labelledby": "title", size: "drawer", ref: node => { node?.focus(); }, onCancel: event => event.preventDefault() };
export const missingLabel: ModalProps = { open: false, onOpenChange: () => {} };
export const missingControl: ModalProps = { open: false, "aria-label": "Title" };
export const badSize: ModalProps = { ...valid, size: "huge" };
export const badHref: ModalProps = { ...valid, href: "/shop" };`;
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
  assert.equal(diagnostics.length, 4, diagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, " ")).join("\n"));
  assert.deepEqual(diagnostics.map(item => item.file.getLineAndCharacterOfPosition(item.start).line + 1), [3, 4, 5, 6]);
});
