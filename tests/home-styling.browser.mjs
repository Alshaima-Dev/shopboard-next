import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

// Run record before a styling migration, then compare against the rebuilt app.
// Keep screenshots outside .next so production builds preserve the baseline.
const mode = process.argv[2];
assert.ok(["record", "compare"].includes(mode), "Use record or compare");
const directory = path.resolve("node_modules/.cache/home-styling-audit");
await fs.mkdir(directory, { recursive: true });
const targets = await (await fetch("http://127.0.0.1:9224/json/list")).json();
const ws = new WebSocket(targets.find(target => target.type === "page").webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let sequence = 0;
const pending = new Map();
ws.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  const callback = pending.get(message.id);
  if (!callback) return;
  pending.delete(message.id);
  if (message.error) callback.reject(Error(JSON.stringify(message.error)));
  else callback.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error(`Timed out: ${expression}`);
}
const widths = [320, 375, 399, 400, 700, 701, 768, 900, 901, 1100, 1101, 1440];
let matches = 0;
const differences = [];
try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setScrollbarsHidden", { hidden: false });
  await send("Page.navigate", { url: "http://127.0.0.1:3107/" });
  await waitFor("document.querySelector('#product-search') && !document.querySelector('#open-cart')?.disabled");
  await evaluate("localStorage.clear()");
  await send("Page.reload", { ignoreCache: true });
  await waitFor("document.querySelector('#product-search') && !document.querySelector('#open-cart')?.disabled");
  // A live API timeout adds a fallback message. Compare the same ready state,
  // rather than treating that existing behavior as a styling regression.
  for (let attempt = 0; attempt < 3 && await evaluate("Boolean(document.querySelector('#shop > p[role=status]'))"); attempt++) {
    await send("Page.reload", { ignoreCache: true });
    await waitFor("document.querySelector('#product-search') && !document.querySelector('#open-cart')?.disabled");
  }
  assert.equal(await evaluate("Boolean(document.querySelector('#shop > p[role=status]'))"), false, "Matched screenshot comparison requires the ready catalog state");
  for (const language of ["en", "ar", "tr"]) {
    await evaluate(`document.querySelector('#language').value='${language}';document.querySelector('#language').dispatchEvent(new Event('change',{bubbles:true}))`);
    await waitFor(`document.documentElement.lang === '${language}'`);
    for (const width of widths) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await evaluate("document.fonts.ready");
      await evaluate("scrollTo(0,document.documentElement.scrollHeight)");
      await evaluate("Promise.all(Array.from(document.images,image=>{image.loading='eager';return image.decode().catch(()=>{})}))");
      await evaluate("scrollTo(0,0);document.activeElement.blur();new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
      const metrics = await evaluate(`(() => {
        const controls=document.querySelector('#product-search').closest('label').parentElement;
        const selectors=['#hero','#hero-title','#benefits','#shop','#product-search','#category','#sort','#results','#signup','#philosophy','footer'];
        const elements=[...selectors.map(selector=>document.querySelector(selector)),controls,...controls.querySelectorAll('label, label > span'),document.querySelector('#results + ul'),document.querySelector('#shop article')];
        const properties=['display','grid-template-columns','grid-column','gap','align-items','margin-top','margin-bottom','padding-top','padding-bottom','padding-inline-start','padding-inline-end','font-family','font-size','font-weight','line-height','color','background-color','background-image','background-position','background-size','background-repeat','border-top-color','border-top-width','border-radius'];
        return {overflow:document.documentElement.scrollWidth>innerWidth,dir:document.documentElement.dir, elements:elements.map(element=>{
          if(!element)return null;
          const rect=element.getBoundingClientRect(),style=getComputedStyle(element);
          return {tag:element.tagName,rect:[rect.x,rect.y,rect.width,rect.height],styles:Object.fromEntries(properties.map(property=>[property,style.getPropertyValue(property).replaceAll('%20',' ').replaceAll('%27',"'")]))};
        })};
      })()`);
      assert.equal(metrics.overflow, false, `${language}/${width} overflow`);
      const key = `${language}-${width}`;
      const height = await evaluate("document.documentElement.scrollHeight");
      const screenshot = Buffer.from((await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } })).data, "base64");
      const hash = createHash("sha256").update(screenshot).digest("hex");
      await fs.writeFile(path.join(directory, `${key}-${mode}.png`), screenshot);
      if (mode === "record") await fs.writeFile(path.join(directory, `${key}.json`), JSON.stringify({ metrics, hash }, null, 2));
      else {
        const baseline = JSON.parse(await fs.readFile(path.join(directory, `${key}.json`), "utf8"));
        assert.deepEqual(metrics, baseline.metrics, `Computed styles/geometry changed: ${key}`);
        if (hash === baseline.hash) matches++;
        else differences.push(key);
      }
      console.log(`${mode}: ${key}`);
    }
  }
  console.log(JSON.stringify({ mode, screenshots: widths.length * 3, identicalScreenshots: matches, screenshotDifferences: differences, directory }));
} finally {
  ws.close();
}
