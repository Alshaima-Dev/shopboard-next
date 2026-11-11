import assert from "node:assert/strict";
import { messages } from "../src/features/i18n/i18n.ts";

const origin = process.env.SHOPBOARD_TEST_ORIGIN ?? "http://127.0.0.1:3107";
const targets = await (await fetch("http://127.0.0.1:9224/json/list")).json();
const page = targets.find(target => target.type === "page");
assert.ok(page, "Start headless Chrome with remote debugging on port 9224.");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
let sequence = 0;
const pending = new Map();
const browserErrors = [];
ws.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") browserErrors.push(JSON.stringify(message.params));
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") browserErrors.push(JSON.stringify(message.params.args));
  const callback = pending.get(message.id);
  if (!callback) return;
  pending.delete(message.id);
  if (message.error) callback.reject(Error(JSON.stringify(message.error)));
  else callback.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error(`Timed out: ${expression}`);
}
async function setSystemTheme(value) {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value }] });
  await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
}
async function navigate(path) {
  await send("Page.navigate", { url: origin + path });
  await waitFor("document.readyState === 'complete' && document.querySelector('#theme-toggle')");
}
function contrast(first, second) {
  const luminance = color => color.map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setScrollbarsHidden", { hidden: true });
  await setSystemTheme("light");
  await navigate("/");
  await evaluate("localStorage.removeItem('shopboard-theme')");
  await send("Page.reload", { ignoreCache: true });
  await waitFor("document.querySelector('#theme-toggle')?.dataset.themePreference === 'system'");
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "system");
  assert.equal(await evaluate("getComputedStyle(document.body).backgroundColor"), "rgb(248, 241, 231)");

  const expectedPreferences = ["light", "dark", "system"];
  for (const preference of expectedPreferences) {
    await evaluate("document.querySelector('#theme-toggle').click()");
    await waitFor(`document.querySelector('#theme-toggle').dataset.themePreference === '${preference}'`);
    assert.equal(await evaluate("localStorage.getItem('shopboard-theme')"), preference);
    assert.equal(await evaluate("document.documentElement.dataset.theme"), preference);
  }
  await setSystemTheme("dark");
  await waitFor("document.querySelector('#theme-toggle').dataset.resolvedTheme === 'dark'");
  assert.equal(await evaluate("getComputedStyle(document.body).backgroundColor"), "rgb(23, 18, 17)");
  await setSystemTheme("light");
  await waitFor("document.querySelector('#theme-toggle').dataset.resolvedTheme === 'light'");
  assert.equal(await evaluate("getComputedStyle(document.body).backgroundColor"), "rgb(248, 241, 231)");
  await evaluate("document.querySelector('#theme-toggle').click()");
  await waitFor("document.querySelector('#theme-toggle').dataset.themePreference === 'light'");
  await evaluate("document.querySelector('#theme-toggle').click()");
  await waitFor("document.querySelector('#theme-toggle').dataset.themePreference === 'dark'");
  await setSystemTheme("light");
  assert.equal(await evaluate("document.querySelector('#theme-toggle').dataset.resolvedTheme"), "dark");
  assert.equal(await evaluate("getComputedStyle(document.body).backgroundColor"), "rgb(23, 18, 17)");

  const traceScript = await send("Page.addScriptToEvaluateOnNewDocument", { source: `globalThis.__themeTrace=[];new MutationObserver(()=>{const value=document.documentElement?.dataset.theme;if(value&&!globalThis.__themeTrace.length)globalThis.__themeTrace.push({value,time:performance.now()})}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-theme']});requestAnimationFrame(()=>globalThis.__firstThemeFrame={theme:document.documentElement.dataset.theme,background:getComputedStyle(document.body).backgroundColor});` });
  await send("Page.reload", { ignoreCache: true });
  await waitFor("document.querySelector('#theme-toggle')?.dataset.themePreference === 'dark'");
  assert.equal(await evaluate("globalThis.__themeTrace[0]?.value"), "dark");
  assert.deepEqual(await evaluate("globalThis.__firstThemeFrame"), { theme: "dark", background: "rgb(23, 18, 17)" });
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: traceScript.identifier });
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "dark");
  assert.equal(await evaluate("document.documentElement.style.colorScheme"), "dark");
  assert.equal(await evaluate("getComputedStyle(document.body).backgroundColor"), "rgb(23, 18, 17)");

  for (const language of ["en", "ar", "tr"]) {
    await evaluate(`document.querySelector('#language').value='${language}';document.querySelector('#language').dispatchEvent(new Event('change',{bubbles:true}))`);
    await waitFor(`document.documentElement.lang === '${language}'`);
    const labels = [];
    for (let count = 0; count < 3; count++) {
      labels.push(await evaluate("document.querySelector('#theme-toggle').getAttribute('aria-label')"));
      assert.equal(await evaluate("document.querySelector('#theme-toggle').title === document.querySelector('#theme-toggle').getAttribute('aria-label')"), true);
      await evaluate("document.querySelector('#theme-toggle').click()");
    }
    for (const text of [messages[language].themeDark, messages[language].themeSystem, messages[language].themeLight]) assert.ok(labels.some(label => label.includes(text)), `${language}: ${text}`);
    assert.equal(await evaluate("document.documentElement.dir"), language === "ar" ? "rtl" : "ltr");
  }

  // Leave an explicit dark choice for route and responsive coverage.
  while (await evaluate("document.querySelector('#theme-toggle').dataset.themePreference") !== "dark") await evaluate("document.querySelector('#theme-toggle').click()");
  for (const path of ["/", "/shop", "/products/1", "/checkout", "/signup", "/about", "/shipping", "/unknown-theme-route"]) {
    await navigate(path);
    assert.equal(await evaluate("document.documentElement.dataset.theme"), "dark", path);
    const colors = await evaluate(`(() => {const style=getComputedStyle(document.body),primary=getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim();return {background:style.backgroundColor,foreground:style.color,primary}})()`);
    assert.deepEqual(colors, { background: "rgb(23, 18, 17)", foreground: "rgb(247, 238, 229)", primary: "#e7aaaa" });
  }
  assert.ok(contrast([247,238,229],[23,18,17]) >= 7);
  assert.ok(contrast([231,170,170],[23,18,17]) >= 4.5);
  assert.ok(contrast([33,20,20],[231,170,170]) >= 4.5);

  await navigate("/shop");
  await waitFor("document.querySelector('[data-add=\"1\"]') && !document.querySelector('[data-add=\"1\"]').disabled");
  const surfaces = await evaluate(`(() => {const get=selector=>getComputedStyle(document.querySelector(selector));return {card:get('main article').backgroundColor,input:get('label[for=product-search]').backgroundColor,soft:get('[data-catalog-controls]').backgroundColor,footer:get('footer>div').backgroundColor}})()`);
  assert.deepEqual(surfaces, { card: "rgb(23, 18, 17)", input: "rgb(23, 18, 17)", soft: "rgba(0, 0, 0, 0)", footer: "rgb(231, 170, 170)" });
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  assert.deepEqual(await evaluate(`(() => {const dialog=document.querySelector('#cart');return {surface:getComputedStyle(dialog).backgroundColor,foreground:getComputedStyle(dialog).color,backdrop:getComputedStyle(dialog,'::backdrop').backgroundColor}})()`), {
    surface: "rgb(23, 18, 17)", foreground: "rgb(247, 238, 229)", backdrop: "rgba(0, 0, 0, 0.68)",
  });
  await evaluate("document.querySelector('#close-cart').click();document.querySelector('[data-add=\"1\"]').click()");
  await waitFor("document.querySelector('#count').textContent !== '0'");
  await navigate("/checkout");
  await waitFor("document.querySelector('#checkout-fullName')");
  await evaluate("document.querySelector('main form button[type=submit]').click()");
  await waitFor("document.querySelector('#checkout-fullName-error')");
  const formTheme = await evaluate(`(() => {const input=getComputedStyle(document.querySelector('#checkout-fullName')),error=getComputedStyle(document.querySelector('#checkout-fullName-error'));return {inputBackground:input.backgroundColor,inputColor:input.color,errorColor:error.color,errorWeight:error.fontWeight}})()`);
  assert.deepEqual(formTheme, { inputBackground: "rgba(0, 0, 0, 0)", inputColor: "rgb(247, 238, 229)", errorColor: "rgb(231, 170, 170)", errorWeight: "600" });

  await navigate("/shop");
  for (const language of ["en", "ar", "tr"]) {
    await evaluate(`document.querySelector('#language').value='${language}';document.querySelector('#language').dispatchEvent(new Event('change',{bubbles:true}))`);
    await waitFor(`document.documentElement.lang === '${language}'`);
    for (const width of [320, 375, 768, 1440]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
      const state = await evaluate(`(() => {const toggle=document.querySelector('#theme-toggle'),header=document.querySelector('header>div'),rect=toggle.getBoundingClientRect(),style=getComputedStyle(toggle);return {overflow:document.documentElement.scrollWidth>innerWidth,size:[rect.width,rect.height],outline:style.outlineColor,headerWidth:header.getBoundingClientRect().width,toggleLeft:rect.left,toggleRight:rect.right}})()`);
      assert.equal(state.overflow, false, `${language}/${width}`);
      assert.deepEqual(state.size, [44,44]);
      assert.ok(state.toggleLeft >= 0 && state.toggleRight <= width);
      await evaluate("document.querySelector('#language').focus()");
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      assert.equal(await evaluate("document.activeElement.id"), "theme-toggle");
      assert.notEqual(await evaluate("getComputedStyle(document.querySelector('#theme-toggle')).outlineStyle"), "none");
    }
  }
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#cart')).backgroundColor"), "rgb(23, 18, 17)");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#cart')).color"), "rgb(247, 238, 229)");
  assert.deepEqual(browserErrors, [], browserErrors.join("\n"));
  console.log("Dark mode initialization, persistence, system changes, routes, localization, focus, responsive layout, and modal passed");
} finally {
  ws.close();
}
