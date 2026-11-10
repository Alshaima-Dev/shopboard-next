import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { messages, languages, formatPrice, formatNumber } from "../src/features/i18n/i18n.ts";
import { routeMessages } from "../src/features/i18n/route-messages.ts";
import { checkoutMessages } from "../src/features/checkout/checkout-messages.ts";
import { products } from "../src/features/products/product-data.ts";
import { catalogMessages } from "../src/features/i18n/catalog-messages.ts";

const origin = process.env.SHOPBOARD_TEST_ORIGIN ?? "http://127.0.0.1:3107";
const targets = await (await fetch("http://127.0.0.1:9224/json/list")).json();
const page = targets.find(target => target.type === "page");
assert.ok(page, "Start headless Chrome with remote debugging on port 9224.");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, {once: true}); ws.addEventListener("error", reject, {once: true}); });
let sequence = 0;
const pending = new Map();
const browserErrors = [];
const browserRequests = [];
ws.addEventListener("message", event => {
  const result = JSON.parse(event.data);
  if (result.method === "Network.requestWillBeSent") browserRequests.push({ method: result.params.request.method, url: result.params.request.url });
  if (result.method === "Runtime.exceptionThrown") browserErrors.push(JSON.stringify(result.params));
  if (result.method === "Runtime.consoleAPICalled" && result.params.type === "error") browserErrors.push(JSON.stringify(result.params.args));
  const callback = pending.get(result.id);
  if (!callback) return;
  pending.delete(result.id);
  if (result.error) {
    callback.reject(Error(JSON.stringify(result.error)));
  } else {
    callback.resolve(result.result);
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, {resolve, reject}); ws.send(JSON.stringify({id, method, params})); });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error("Timed out: " + expression);
}

try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  // Exclude platform scrollbar width from matched-viewport geometry checks.
  await send("Emulation.setScrollbarsHidden", { hidden: true });
  await send("Page.navigate", {url: origin + "/"});
  await waitFor("location.pathname === '/' && document.readyState === 'complete'");
  await evaluate("localStorage.setItem('shopboard-language','en')");
  await send("Page.navigate", {url: origin + "/shop"});
  await waitFor("document.querySelectorAll('main article').length === 12");
  await evaluate("document.fonts.ready.then(() => true)");
  for (const width of [320, 375, 399, 400, 700, 701, 768, 900, 901, 1100, 1101, 1440, 1600]) {
    await send("Emulation.setDeviceMetricsOverride", {width, height: 1000, deviceScaleFactor: 1, mobile: false});
    await waitFor(`innerWidth === ${width}`);
    await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))");
    const state = await evaluate(`(() => {
      const card = document.querySelector('main article');
      const grid = card.closest('ul');
      const style = getComputedStyle(grid);
      const image = card.querySelector('img');
      const rect = image.getBoundingClientRect();
      return {
        width: innerWidth, columns: style.gridTemplateColumns.split(' ').length,
        gapX: style.columnGap, gapY: style.rowGap,
        overflow: document.documentElement.scrollWidth > innerWidth,
        cardRadius: getComputedStyle(card).borderRadius,
        cardPadding: getComputedStyle(card).padding,
        imageRadius: getComputedStyle(image.parentElement).borderRadius,
        imageWidth: rect.width, imageHeight: rect.height,
        fit: getComputedStyle(image).objectFit,
        headingSize: getComputedStyle(card.querySelector('h2')).fontSize,
        headingColor: getComputedStyle(card.querySelector('h2')).color,
        priceLine: getComputedStyle(card.querySelector('bdi')).lineHeight,
        priceHeight: card.querySelector('bdi').getBoundingClientRect().height,
        categorySize: getComputedStyle(card.querySelectorAll('p')[0]).fontSize,
        descriptionSize: getComputedStyle(card.querySelectorAll('p')[1]).fontSize,
        link: card.querySelector('a').getAttribute('href'),
        containers: ['header > div', 'main', 'footer > div'].map(selector => {
          const box = document.querySelector(selector).getBoundingClientRect();
          return { left: box.left, width: box.width, right: innerWidth - box.right };
        }),
        gridWidth: grid.getBoundingClientRect().width,
      };
    })()`);
    assert.equal(state.columns, width < 400 ? 1 : width < 901 ? 2 : 3);
    assert.equal(state.gapX, width < 701 ? "16px" : "24px");
    assert.equal(state.gapY, width < 701 ? "24px" : "28px");
    assert.equal(state.overflow, false);
    assert.equal(state.cardRadius, "21px");
    assert.equal(state.cardPadding, "8px");
    assert.equal(state.imageRadius, "12px");
    assert.ok(Math.abs(state.imageWidth - state.imageHeight) < 1);
    assert.equal(state.fit, "contain");
    assert.equal(state.headingSize, "14px");
    assert.equal(state.headingColor, "rgb(107, 44, 44)");
    assert.equal(state.priceLine, "normal");
    assert.equal(state.priceHeight, 18);
    assert.equal(state.categorySize, "11px");
    assert.equal(state.descriptionSize, "12px");
    assert.equal(state.link, "/products/1");
    const gutter = width < 701 ? 18 : width < 1101 ? 32 : 56;
    const containerWidth = Math.min(1440, width - gutter * 2);
    for (const box of state.containers) {
      assert.ok(Math.abs(box.width - containerWidth) < 1, JSON.stringify(box));
      assert.ok(Math.abs(box.left - (width - containerWidth) / 2) < 1);
      assert.ok(Math.abs(box.left - box.right) < 1);
    }
    assert.ok(Math.abs(state.gridWidth - containerWidth) < 1);
    const imageWidth = (containerWidth - (state.columns - 1) * parseFloat(state.gapX)) / state.columns - 18;
    assert.ok(Math.abs(state.imageWidth - imageWidth) < 1);
    console.log("Layout passed: " + width + "px, " + state.columns + " columns");
    if ([375, 768, 1440, 1600].includes(width)) console.log(JSON.stringify({ width, containerWidth, gutter: state.containers[0].left, imageWidth: state.imageWidth }));
  }
  await waitFor("document.querySelector('main article img').complete && document.querySelector('main article img').naturalWidth > 0");
  const imageSrc = await evaluate("document.querySelector('main article img').currentSrc");
  assert.ok(imageSrc.includes("/_next/image?"));
  const optimized = await fetch(imageSrc, {headers: {accept: "image/webp"}});
  assert.equal(optimized.status, 200);
  assert.match(optimized.headers.get("content-type"), /image\//);
  console.log("Optimized image loaded: " + optimized.headers.get("content-type"));

  await send("Emulation.setFocusEmulationEnabled", {enabled:true});
  await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  await evaluate("document.querySelector('main article').scrollIntoView({block:'center'}); document.querySelector('main article a').focus()");
  const focus = await evaluate("({style:getComputedStyle(document.activeElement).outlineStyle,width:getComputedStyle(document.activeElement).outlineWidth,shadow:getComputedStyle(document.querySelector('main article')).boxShadow})");
  assert.equal(focus.style, "solid");
  assert.equal(focus.width, "2px");
  assert.ok(focus.shadow.includes("20px"));
  console.log("Keyboard focus outline and card elevation passed");

  await evaluate("document.activeElement.blur()");
  const point = await evaluate("(() => {const r=document.querySelector('main article').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
  await send("Input.dispatchMouseEvent", {type:"mouseMoved", ...point});
  assert.ok(await evaluate("getComputedStyle(document.querySelector('main article')).boxShadow.includes('20px')"));
  console.log("Fine-pointer hover elevation passed");
  await send("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  assert.equal(await evaluate("getComputedStyle(document.querySelector('main article')).animationName"), "none");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('main article')).transitionDuration"), "0s");
  await send("Emulation.setEmulatedMedia", {features:[]});

  await evaluate(`document.documentElement.lang='ar';document.documentElement.dir='rtl';
    document.querySelectorAll('main article').forEach(card=>{card.lang='ar';card.dir='rtl';});
    document.querySelector('main article').closest('ul').dir='rtl';`);
  const rtl = await evaluate(`(() => {const card=document.querySelector('main article');return {
    direction:getComputedStyle(card).direction,align:getComputedStyle(card).textAlign,
    font:getComputedStyle(card).fontFamily,titleLine:getComputedStyle(card.querySelector('h2')).lineHeight,
    overflow:document.documentElement.scrollWidth>innerWidth,
    priceIsolation:getComputedStyle(card.querySelector('bdi')).unicodeBidi
  };})()`);
  assert.equal(rtl.direction, "rtl");
  assert.equal(rtl.align, "start");
  assert.ok(rtl.font.includes("Noto Sans Arabic"));
  assert.ok(Math.abs(parseFloat(rtl.titleLine) - 25.2) < 0.1);
  assert.equal(rtl.overflow, false);
  assert.equal(rtl.priceIsolation, "isolate");
  console.log("Arabic/RTL style preparation passed (DOM emulation; no language switching)");

  await send("Emulation.setDeviceMetricsOverride", {width: 1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelectorAll('main article').length === 12");
  await evaluate("document.fonts.ready.then(() => true)");
  const shot = await send("Page.captureScreenshot", {format:"png",captureBeyondViewport:true});
  await fs.writeFile(".next/product-cards-desktop.png",Buffer.from(shot.data,"base64"));
  await send("Emulation.setDeviceMetricsOverride", {width:375,height:900,deviceScaleFactor:1,mobile:true});
  await waitFor("innerWidth === 375");
  await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))");
  const mobileShot = await send("Page.captureScreenshot", {format:"png",captureBeyondViewport:true});
  await fs.writeFile(".next/product-cards-mobile.png",Buffer.from(mobileShot.data,"base64"));

  await send("Network.setBlockedURLs", {urls:["*leather-tote-bag*"]});
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelector('main article img')?.getAttribute('src')?.includes('fallback.svg') && document.querySelector('main article img').naturalWidth > 0 && document.querySelector('main article [role=status]')");
  const caption = await evaluate(`(() => {
    const status = document.querySelector('main article [role=status]');
    const photo = status.parentElement.getBoundingClientRect();
    const rect = status.getBoundingClientRect();
    return {
      position: getComputedStyle(status).position,
      bottomGap: photo.bottom - rect.bottom,
      widthDifference: photo.width - rect.width,
      belowCenter: rect.top > photo.top + photo.height / 2,
      background: getComputedStyle(status).backgroundColor,
    };
  })()`);
  assert.equal(caption.position, "absolute");
  assert.ok(Math.abs(caption.bottomGap) < 1);
  assert.ok(Math.abs(caption.widthDifference) < 1);
  assert.ok(caption.belowCenter);
  assert.match(caption.background, /\/\s*0\.94\)/);
  console.log("Fallback caption spans the bottom edge with 94% background opacity");
  console.log("Broken product image recovers to original SVG and accessible status");
  await send("Network.setBlockedURLs", {urls:["*leather-tote-bag*","*fallback.svg*"]});
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelectorAll('main article').length === 12 && !document.querySelector('main article').querySelector('img') && document.querySelector('main article').querySelector('[role=status]')");
  console.log("Failed fallback hides the broken image and retains accessible status");
  await send("Network.setBlockedURLs", {urls:[]});

  // Exercise the restored controls against the real server-rendered card slots.
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelectorAll('main article').length === 12");
  await waitFor("document.readyState === 'complete'");
  async function setSearch(value) {
    await evaluate("document.querySelector('#product-search').focus(); document.querySelector('#product-search').select()");
    await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Backspace",code:"Backspace",windowsVirtualKeyCode:8});
    await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Backspace",code:"Backspace",windowsVirtualKeyCode:8});
    if (value) await send("Input.insertText", {text:value});
  }
  async function setSelect(id, value) {
    await evaluate(`(() => {
      const select = document.getElementById(${JSON.stringify(id)});
      select.value = ${JSON.stringify(value)};
      select.dispatchEvent(new Event('change', {bubbles:true}));
    })()`);
  }
  async function expectIds(ids) {
    const expected = JSON.stringify(ids);
    await waitFor(`JSON.stringify([...document.querySelectorAll('main article h2 a')].map(a => Number(a.getAttribute('href').split('/').pop()))) === ${JSON.stringify(expected)}`);
    assert.equal(await evaluate("location.search"), "");
  }
  await setSearch("  LEATHER  ");
  await expectIds([1, 12]);
  await setSelect("category", "Bags");
  await expectIds([1]);
  await setSelect("sort", "high");
  await expectIds([1]);
  assert.equal(await evaluate("document.querySelector('#product-search').value"), "  LEATHER  ");

  await evaluate("document.querySelector('#affordable-products').click()");
  await expectIds([2, 3, 7, 9, 12]);
  assert.equal(await evaluate("document.querySelector('#product-search').value"), "");
  assert.equal(await evaluate("document.querySelector('#category').value"), "");
  assert.equal(await evaluate("document.querySelector('#sort').value"), "featured");
  assert.equal(await evaluate("document.querySelector('#affordable-products').getAttribute('aria-current')"), "true");
  await setSelect("category", "Accessories");
  await setSelect("sort", "low");
  await expectIds([7, 12, 9]);
  await setSelect("sort", "high");
  await expectIds([9, 12, 7]);
  await setSearch("belt");
  await expectIds([12]);
  console.log("Combined search/category/sort/under-$50 filters and same-page mode reset passed");

  await evaluate("document.querySelector('nav a[href=\"/about\"]').click()");
  await waitFor("location.pathname === '/about'");
  await waitFor("document.querySelector('header a[href=\"/about\"]').getAttribute('aria-current') === 'page'");
  assert.equal(await evaluate("document.querySelector('footer a[href=\"/about\"]').getAttribute('aria-current')"), "page");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('header a[href=\"/about\"]'),'::after').height"), "1px");
  await evaluate("document.querySelector('footer a[href=\"/shop\"]').click()");
  await expectIds([12]);
  assert.equal(await evaluate("document.querySelector('#category').value"), "Accessories");
  assert.equal(await evaluate("document.querySelector('#sort').value"), "high");
  assert.equal(await evaluate("document.querySelector('#product-search').value"), "belt");
  await evaluate("document.querySelector('main article h2 a').click()");
  await waitFor("location.pathname === '/products/12' && document.querySelector('#product-title')");
  await evaluate("history.back()");
  await expectIds([12]);
  console.log("Product links and catalog state across navigation/back passed");

  await setSearch("no-such-product");
  await expectIds([]);
  assert.ok(await evaluate("document.querySelector('#results').textContent.includes('0 pieces')"));
  assert.equal(await evaluate("document.querySelector('#results').getAttribute('aria-live')"), "polite");
  await evaluate("[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Clear filters').click()");
  await expectIds([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(await evaluate("document.querySelector('#shop-all').getAttribute('aria-current')"), "true");
  await evaluate("document.querySelector('nav a[href=\"/about\"]').click()");
  await waitFor("location.pathname === '/about'");
  await evaluate("document.querySelector('#affordable-products').click()");
  await expectIds([2, 3, 7, 9, 12]);
  assert.equal(await evaluate("location.pathname"), "/shop");
  await evaluate("document.querySelector('#shop-all').click()");
  await expectIds([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  console.log("Empty-result recovery, cross-route catalog modes, and URL preservation passed");

  await evaluate("localStorage.removeItem('shopboard-catalog-cart-v2')");
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelector('#open-cart') && !document.querySelector('#open-cart').disabled && document.querySelectorAll('main article').length === 12");
  await evaluate("document.querySelector('main [data-add=\"1\"]').click(); document.querySelector('main [data-add=\"1\"]').click(); document.querySelector('main [data-add=\"8\"]').click()");
  await waitFor("document.querySelector('#count').textContent === '3'");
  assert.deepEqual(JSON.parse(await evaluate("localStorage.getItem('shopboard-catalog-cart-v2')")), {"1":2,"8":1});
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  assert.equal(await evaluate("document.querySelector('#cart-total').textContent"), "$328");
  assert.ok(await evaluate("document.querySelector('#cart').contains(document.activeElement)"));
  for (let i = 0; i < 8; i++) {
    await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    assert.ok(await evaluate("document.querySelector('#cart').contains(document.activeElement)"));
  }
  await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
  await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
  await waitFor("!document.querySelector('#cart').open && document.activeElement.id === 'open-cart'");
  await evaluate("document.querySelector('nav a[href=\"/about\"]').click()");
  await waitFor("location.pathname === '/about'");
  assert.equal(await evaluate("document.querySelector('#count').textContent"), "3");
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelector('#count')?.textContent === '3'");
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  assert.equal(await evaluate("document.querySelector('#cart-total').textContent"), "$328");
  await evaluate("document.querySelector('[aria-label=\"Decrease Leather Tote Bag quantity\"]').click()");
  await waitFor("document.querySelector('#cart-total').textContent === '$239'");
  await evaluate("document.querySelector('[data-remove=\"8\"]').click()");
  await waitFor("document.querySelector('#cart-total').textContent === '$89'");
  await evaluate("document.querySelector('#clear-cart').click()");
  await waitFor("document.activeElement.id === 'confirm-clear'");
  await evaluate("document.querySelector('#cancel-clear').click()");
  await waitFor("document.activeElement.id === 'clear-cart'");
  assert.equal(await evaluate("document.querySelector('#count').textContent"), "1");
  await evaluate("document.querySelector('#clear-cart').click()");
  await evaluate("document.querySelector('#confirm-clear').click()");
  await waitFor("document.querySelector('#count').textContent === '0' && document.activeElement.id === 'keep-shopping'");
  assert.equal(await evaluate("localStorage.getItem('shopboard-catalog-cart-v2')"), "{}");
  await evaluate("document.querySelector('#keep-shopping').click()");
  await waitFor("!document.querySelector('#cart').open");
  console.log("Cart totals, persistence, navigation, keyboard trapping/Escape, clear/cancel, and empty recovery passed");

  await evaluate("localStorage.setItem('shopboard-catalog-cart-v2', JSON.stringify({'1':200,'2':-1,'3':1.5,'4':'2','999':5}))");
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelector('#count').textContent === '99'");
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  await evaluate("document.querySelector('[aria-label=\"Increase Leather Tote Bag quantity\"]').click()");
  assert.equal(await evaluate("document.querySelector('#count').textContent"), "99");
  assert.equal(await evaluate("document.querySelector('#cart-total').textContent"), "$8,811");
  await evaluate("document.querySelector('[data-remove=\"1\"]').click()");
  await waitFor("document.activeElement.id === 'keep-shopping'");
  await evaluate("document.querySelector('#keep-shopping').click()");
  await evaluate("localStorage.setItem('shopboard-catalog-cart-v2', '{bad JSON')");
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelector('#open-cart') && !document.querySelector('#open-cart').disabled");
  assert.equal(await evaluate("document.querySelector('#count').textContent"), "0");
  await evaluate("document.querySelector('footer a[href=\"/shop\"]').click()");
  await waitFor("document.querySelector('main [data-add=\"2\"]')");
  await evaluate("document.querySelector('main [data-add=\"2\"]').click()");
  await waitFor("document.querySelector('#count').textContent === '1'");
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  await evaluate("document.querySelector('[aria-label=\"Decrease Canvas Backpack quantity\"]').click()");
  await waitFor("document.querySelector('#count').textContent === '0' && document.activeElement.id === 'keep-shopping'");
  console.log("Cart quantity cap, invalid/corrupt storage, decrement-to-remove, and removal focus passed");
  await evaluate("document.querySelector('#keep-shopping').click()");
  await evaluate("document.querySelector('main a[href=\"/products/12\"]').click()");
  await waitFor("location.pathname === '/products/12' && document.querySelector('main [data-add=\"12\"]')");
  await evaluate("document.querySelector('main [data-add=\"12\"]').click()");
  await waitFor("document.querySelector('#count').textContent === '1'");
  assert.ok(await evaluate("document.body.textContent.includes('A good choice. Added to your bag.')"));
  await send("Emulation.setDeviceMetricsOverride", {width:1024,height:900,deviceScaleFactor:1,mobile:false});
  await waitFor("innerWidth === 1024");
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  assert.equal(await evaluate("document.querySelector('#cart').getBoundingClientRect().width"), 480);
  assert.equal(await evaluate("document.querySelector('#cart-total').textContent"), "$30");
  await evaluate("document.documentElement.dir = 'rtl'");
  assert.equal(await evaluate("document.querySelector('#cart').getBoundingClientRect().x"), 0);
  await evaluate("document.documentElement.dir = 'ltr'");
  await evaluate("document.querySelector('#cart a[href=\"/checkout\"]').click()");
  await waitFor("location.pathname === '/checkout' && !document.querySelector('#cart').open");
  assert.equal(await evaluate("document.querySelector('#count').textContent"), "1");
  await send("Emulation.setDeviceMetricsOverride", {width:375,height:900,deviceScaleFactor:1,mobile:true});
  await waitFor("innerWidth === 375");
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  assert.equal(await evaluate("document.querySelector('#cart').getBoundingClientRect().width"), 375);
  assert.equal(await evaluate("document.querySelector('#cart').scrollWidth > document.querySelector('#cart').clientWidth"), false);
  console.log("Detail-page add, feedback, existing checkout link, and mobile/RTL drawer sizing passed");

  await evaluate("document.querySelector('#close-cart').click(); localStorage.removeItem('shopboard-catalog-cart-v2')");
  const blockedStorage = await send("Page.addScriptToEvaluateOnNewDocument", {
    source:"Storage.prototype.getItem = function(){throw new Error('Storage blocked for test')}; Storage.prototype.setItem = function(){throw new Error('Storage blocked for test')};",
  });
  await send("Page.navigate", {url:origin + "/shop"});
  await waitFor("document.querySelector('#open-cart') && !document.querySelector('#open-cart').disabled && document.querySelector('main [data-add=\"1\"]')");
  await evaluate("document.querySelector('main [data-add=\"1\"]').click()");
  await waitFor("document.querySelector('#count').textContent === '1'");
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  assert.equal(await evaluate("document.querySelector('#cart-total').textContent"), "$89");
  await send("Page.removeScriptToEvaluateOnNewDocument", {identifier:blockedStorage.identifier});
  console.log("Blocked localStorage still permits in-memory add and totals");

  await send("Page.navigate", {url:origin + "/checkout"});
  await waitFor("document.querySelector('#open-cart') && !document.querySelector('#open-cart').disabled && document.querySelector('main').textContent.includes('Your bag is empty.')");
  assert.equal(await evaluate("document.querySelector('main form')"), null);
  assert.equal(await evaluate("document.querySelector('main a').getAttribute('href')"), "/");
  await evaluate("localStorage.setItem('shopboard-catalog-cart-v2', JSON.stringify({'1':2}))");
  await send("Page.reload", {ignoreCache:true});
  await waitFor("document.querySelector('#checkout-fullName')");
  await waitFor("document.readyState === 'complete'");
  assert.equal(await evaluate("document.querySelector('#checkout-subtotal').textContent"), "$178");
  for (const width of [375,768,1440]) {
    await send("Emulation.setDeviceMetricsOverride", {width,height:1000,deviceScaleFactor:1,mobile:false});
    await waitFor(`innerWidth === ${width}`);
    await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))");
    const layout = await evaluate("({fields:getComputedStyle(document.querySelector('#checkout-fullName').parentElement.parentElement).gridTemplateColumns.split(' ').length,page:getComputedStyle(document.querySelector('form').parentElement).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth})");
    assert.equal(layout.fields,width<701?1:2);
    assert.equal(layout.page,width<901?1:2);
    assert.equal(layout.overflow,false);
  }
  assert.equal(await evaluate("document.querySelector('#checkout-email').dir"), "ltr");
  assert.equal(await evaluate("document.querySelector('#checkout-phone').dir"), "ltr");
  await evaluate("document.querySelector('main form button[type=submit]').click()");
  await waitFor("document.querySelector('#checkout-fullName-error') && document.activeElement.id === 'checkout-fullName'");
  assert.equal(await evaluate("document.querySelector('#checkout-fullName-error').textContent"), "Enter a name with at least two characters.");
  assert.equal(await evaluate("document.querySelector('#checkout-email-error').textContent"), "Enter a valid email address.");
  assert.equal(await evaluate("document.querySelector('#checkout-demo-error').textContent"), "Confirm that no order or payment will be processed.");
  assert.equal(await evaluate("document.querySelector('#checkout-fullName').getAttribute('aria-invalid')"), "true");
  assert.equal(await evaluate("document.querySelector('#checkout-fullName').getAttribute('aria-describedby')"), "checkout-fullName-error");

  async function fillCheckout(id,value) {
    await waitFor("!document.querySelector('main fieldset').disabled && document.querySelector('main form').getAttribute('aria-busy') === 'false'");
    await evaluate(`document.getElementById(${JSON.stringify(id)}).focus(); document.getElementById(${JSON.stringify(id)}).select()`);
    await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Backspace",code:"Backspace",windowsVirtualKeyCode:8});
    await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Backspace",code:"Backspace",windowsVirtualKeyCode:8});
    if(value) await send("Input.insertText",{text:value});
  }
  for (const [id,value] of Object.entries({
    fullName:"Demo Visitor",email:"demo@example.test",phone:"letters",address:"12 Demo Street",
    city:"Demo City",postalCode:"34000",country:"Türkiye",
  })) await fillCheckout("checkout-"+id,value);
  await evaluate("document.querySelector('main form button[type=submit]').click()");
  await waitFor("document.querySelector('#checkout-phone-error')");
  assert.equal(await evaluate("document.querySelector('#checkout-phone-error').textContent"), "Enter a phone number with at least seven digits, or leave it blank.");
  await fillCheckout("checkout-phone","");
  await evaluate("document.querySelector('main form button[type=submit]').click()");
  await waitFor("document.activeElement.id === 'checkout-demo'");
  assert.equal(await evaluate("document.querySelector('#checkout-success-title')"),null);
  console.log("Checkout empty state, responsive fields, invalid submissions, acknowledgement, and accessible error focus passed");

  const storageBefore = await evaluate("JSON.stringify({...localStorage})");
  const requestStart = browserRequests.length;
  await evaluate("document.querySelector('#checkout-demo').click(); document.querySelector('main form button[type=submit]').click()");
  await waitFor("document.querySelector('#checkout-success-title') && document.activeElement.id === 'checkout-success-title'");
  assert.equal(await evaluate("document.querySelector('#count').textContent"),"2");
  assert.equal(await evaluate("JSON.stringify({...localStorage})"),storageBefore);
  assert.ok(await evaluate("document.querySelector('main').textContent.includes('No order was placed, no payment was taken')"));
  assert.ok(await evaluate("document.querySelector('main dl').textContent.includes('$178')"));
  assert.equal(browserRequests.slice(requestStart).some(request=>request.method!=="GET" && request.method!=="HEAD"),false);
  assert.equal(await evaluate("location.pathname"),"/checkout");
  assert.equal(await evaluate("location.search"),"");
  await evaluate("[...document.querySelectorAll('main button')].find(button=>button.textContent==='Review again').click()");
  await waitFor("document.querySelector('#checkout-fullName')");
  assert.equal(await evaluate("document.querySelector('#checkout-fullName').value"),"");
  assert.equal(await evaluate("document.querySelector('#checkout-email').value"),"");
  assert.equal(await evaluate("document.querySelector('#checkout-demo').checked"),false);
  await evaluate("document.querySelector('main [aria-label=\"Increase Leather Tote Bag quantity\"]').click()");
  await waitFor("document.querySelector('#checkout-subtotal').textContent === '$267' && document.querySelector('#count').textContent === '3'");
  await evaluate("document.querySelector('main [data-remove=\"1\"]').click()");
  await waitFor("!document.querySelector('main form') && document.querySelector('main').textContent.includes('Your bag is empty.')");
  assert.equal(await evaluate("document.querySelector('#count').textContent"),"0");
  await evaluate("document.querySelector('main a').click()");
  await waitFor("location.pathname === '/'");
  console.log("Checkout success/reset, unchanged saved cart, no order request, live summary controls, removal-to-empty, and navigation passed");

  await evaluate("document.querySelector('footer a[href=\"/signup\"]').click()");
  await waitFor("location.pathname === '/signup' && document.querySelector('#signup-form fieldset') && !document.querySelector('#signup-form fieldset').disabled");
  const signupHtml = await (await fetch(origin + "/signup")).text();
  assert.match(signupHtml, /<fieldset[^>]*disabled/);
  assert.equal(await evaluate("document.querySelector('#signup-form').method"),"post");
  assert.equal(await evaluate("document.querySelector('#signup-form').noValidate"),false);
  assert.equal(await evaluate("document.querySelector('#signup-email').autocomplete"),"email");
  assert.equal(await evaluate("document.querySelector('#signup-email').dir"),"ltr");
  assert.equal(await evaluate("document.querySelector('#signup-password').autocomplete"),"new-password");
  assert.equal(await evaluate("document.querySelector('#signup-password').minLength"),8);
  assert.equal(await evaluate("document.querySelector('#signup-password').getAttribute('aria-describedby')"),"signup-password-hint");
  for (const width of [375,768,1440]) {
    await send("Emulation.setDeviceMetricsOverride", {width,height:1000,deviceScaleFactor:1,mobile:false});
    await waitFor(`innerWidth === ${width}`);
    await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))");
    const layout = await evaluate("({overflow:document.documentElement.scrollWidth>innerWidth,formWidth:document.querySelector('#signup-form').getBoundingClientRect().width,inputSize:getComputedStyle(document.querySelector('#signup-email')).fontSize})");
    assert.equal(layout.overflow,false);
    assert.ok(layout.formWidth<=480);
    assert.equal(layout.inputSize,"16px");
  }
  await evaluate("document.querySelector('#signup-form button').click()");
  await waitFor("document.activeElement.id === 'signup-email'");
  assert.equal(await evaluate("document.querySelector('#signup-email').validity.valueMissing"),true);
  assert.equal(await evaluate("document.querySelector('#signup-password').validity.valueMissing"),true);
  assert.ok(await evaluate("document.querySelector('#signup-email').validationMessage.length > 0"));

  async function fillSignup(id,value) {
    await evaluate(`document.getElementById(${JSON.stringify(id)}).focus(); document.getElementById(${JSON.stringify(id)}).select()`);
    await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Backspace",code:"Backspace",windowsVirtualKeyCode:8});
    await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Backspace",code:"Backspace",windowsVirtualKeyCode:8});
    if(value) await send("Input.insertText",{text:value});
  }
  await fillSignup("signup-email","not-an-email");
  await fillSignup("signup-password","short");
  await evaluate("document.querySelector('#signup-form button').click()");
  await waitFor("document.activeElement.id === 'signup-email'");
  assert.equal(await evaluate("document.querySelector('#signup-email').validity.typeMismatch"),true);
  assert.equal(await evaluate("document.querySelector('#signup-password').value"),"short");
  await fillSignup("signup-email","demo@example.test");
  await evaluate("document.querySelector('#signup-form button').click()");
  await waitFor("document.activeElement.id === 'signup-password'");
  assert.equal(await evaluate("document.querySelector('#signup-password').validity.tooShort"),true);
  assert.equal(await evaluate("document.querySelector('#signup [role=status]').textContent"),"");
  const signupStorageBefore = await evaluate("JSON.stringify({local:{...localStorage},session:{...sessionStorage}})");
  const signupRequestStart = browserRequests.length;
  await fillSignup("signup-password","demo-pass-123");
  await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  assert.equal(await evaluate("document.activeElement === document.querySelector('#signup-form button')"),true);
  await send("Input.dispatchKeyEvent", {type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,text:"\r"});
  await send("Input.dispatchKeyEvent", {type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await waitFor("document.querySelector('#signup [role=status]').textContent.includes('Your details are valid. No account was created; nothing was sent or saved.')");
  assert.equal(await evaluate("document.querySelector('#signup-email').value"),"");
  assert.equal(await evaluate("document.querySelector('#signup-password').value"),"");
  assert.equal(await evaluate("JSON.stringify({local:{...localStorage},session:{...sessionStorage}})"),signupStorageBefore);
  assert.equal(browserRequests.slice(signupRequestStart).some(request=>request.method!=="GET"&&request.method!=="HEAD"),false);
  assert.equal(await evaluate("location.pathname"),"/signup");
  assert.equal(await evaluate("location.search"),"");
  await waitFor("document.querySelector('#signup [role=status]').textContent === ''");
  await evaluate("document.querySelector('footer a[href=\"/shop\"]').click()");
  await waitFor("location.pathname === '/shop' && document.querySelector('#product-search')");
  await evaluate("history.back()");
  await waitFor("location.pathname === '/signup' && document.querySelector('#signup-email')");
  assert.equal(await evaluate("document.querySelector('#signup-email').value"),"");
  assert.equal(await evaluate("document.querySelector('#signup-password').value"),"");
  console.log("Signup native errors, short-password rejection, keyboard submission, reset/feedback timeout, no persistence/request, navigation, and SSR guard passed");

  async function changeLanguage(language) {
    await evaluate(`(() => { const select=document.querySelector('#language'); select.value=${JSON.stringify(language)};select.dispatchEvent(new Event('change',{bubbles:true})); })()`);
    await waitFor(`document.documentElement.lang === ${JSON.stringify(language)} && document.documentElement.dir === ${JSON.stringify(languages[language].dir)}`);
    await evaluate("document.fonts.ready.then(()=>true)");
    assert.equal(await evaluate("localStorage.getItem('shopboard-language')"),language);
  }
  await evaluate("document.querySelector('#shop-all').click()");
  await expectIds([1,2,3,4,5,6,7,8,9,10,11,12]);
  const languageTimeOrigin = await evaluate("performance.timeOrigin");
  for (const language of ["ar","tr","en"]) {
    await changeLanguage(language);
    assert.equal(await evaluate("document.querySelector('#shop-all').textContent.trim()"),messages[language].shopAll);
    assert.equal(await evaluate("document.querySelector('main h1').textContent"),messages[language].shopTitle);
    assert.equal(await evaluate("document.querySelector('main article h2 a').textContent"),products[0].translations[language].name);
    assert.equal(await evaluate("document.querySelector('main article p:last-child').textContent"),products[0].translations[language].description);
    assert.equal(await evaluate("document.querySelector('main article img').alt"),products[0].translations[language].alt);
    assert.equal(await evaluate("document.querySelector('main article bdi').textContent"),formatPrice(89,language));
    assert.equal(await evaluate("document.querySelector('#product-search').placeholder"),messages[language].searchPlaceholder);
    assert.equal(await evaluate("document.title"),messages[language].title);
    assert.equal(await evaluate("document.querySelector('meta[name=description]').content"),messages[language].meta);
    assert.equal(await evaluate("performance.timeOrigin"),languageTimeOrigin);
    for (const width of [320,375,768,1440]) {
      await send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:false});
      await waitFor(`innerWidth === ${width}`);
      await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))");
      assert.equal(await evaluate("document.documentElement.scrollWidth > innerWidth"),false);
      const shell = await evaluate(`(() => {
        const header = document.querySelector('header > div');
        const footer = document.querySelector('footer > div');
        const bag = document.querySelector('#open-cart');
        const picker = document.querySelector('#language');
        const announcement = document.querySelector('#shipping-offer').parentElement;
        const style = element => getComputedStyle(element);
        return {
          headerAreas: style(header).gridTemplateAreas,
          footerAreas: style(footer).gridTemplateAreas,
          headerWidth: header.getBoundingClientRect().width,
          footerWidth: footer.getBoundingClientRect().width,
          announcementWidth: announcement.getBoundingClientRect().width,
          footerBackground: style(footer).backgroundColor,
          footerColor: style(footer).color,
          footerRadius: style(footer).borderTopLeftRadius,
          footerPadding: [style(footer).paddingTop, style(footer).paddingRight, style(footer).paddingBottom],
          pickerWidth: picker.getBoundingClientRect().width,
          pickerHeight: picker.getBoundingClientRect().height,
          bagWidth: bag.getBoundingClientRect().width,
          bagLabel: style(bag.querySelector('span')).display,
          badgeBackground: style(document.querySelector('#count')).backgroundColor,
          ribbonPaths: header.querySelectorAll('a[href="/"] svg path').length,
          ribbonWidth: header.querySelector('a[href="/"] svg').getBoundingClientRect().width,
          brandFont: style(header.querySelector('a[href="/"] span')).fontFamily,
          brandSize: style(header.querySelector('a[href="/"] span')).fontSize,
          navHeight: Math.min(...Array.from(header.querySelectorAll('nav a'), link => link.getBoundingClientRect().height)),
          offer: document.querySelector('#shipping-offer').textContent,
          footerActive: footer.querySelector('a[aria-current="page"]')?.getAttribute('href'),
        };
      })()`);
      assert.equal(shell.headerAreas, width < 701 ? '"brand actions" "nav nav"' : '"brand nav actions"');
      assert.equal(shell.footerAreas, width < 701 ? '"brand" "tagline" "navigation" "credit"' : '"brand navigation" "tagline navigation" "credit credit"');
      const expectedShellWidth = Math.min(1440, width - 2 * (width < 701 ? 18 : width < 1101 ? 32 : 56));
      for (const measured of [shell.headerWidth, shell.footerWidth, shell.announcementWidth]) assert.ok(Math.abs(measured - expectedShellWidth) < 1);
      assert.equal(shell.footerBackground, "rgb(107, 44, 44)");
      assert.equal(shell.footerColor, "rgb(248, 241, 231)");
      assert.equal(shell.footerRadius, "16px");
      assert.deepEqual(shell.footerPadding, width < 701 ? ["36px", "24px", "32px"] : ["44px", "40px", "28px"]);
      assert.equal(shell.pickerWidth,108);
      assert.ok(shell.pickerHeight >= 44);
      assert.equal(shell.bagWidth, width < 701 ? 58 : 116);
      // Flex items are blockified in computed styles even with display:inline.
      if (width < 701) assert.equal(shell.bagLabel,"none");
      else assert.notEqual(shell.bagLabel,"none");
      assert.equal(shell.badgeBackground,"rgb(216, 195, 165)");
      assert.equal(shell.ribbonPaths,4);
      assert.equal(shell.ribbonWidth,width < 701 ? 42 : 46);
      assert.match(shell.brandFont,/Cormorant/i);
      if (width >= 701) assert.equal(shell.brandSize,"32px");
      assert.ok(shell.navHeight >= 44);
      assert.equal(shell.offer,messages[language].shippingOffer.replace("{price}",formatPrice(100,language)));
      assert.equal(shell.footerActive,"/shop");
      if ([375,768,1440].includes(width)) console.log(`Header/footer parity passed: ${language}, ${width}px`);
    }
  }
  await setSelect("category","Bags");
  await setSelect("sort","high");
  await setSearch("bag");
  await changeLanguage("ar");
  assert.equal(await evaluate("document.querySelector('#product-search').value"),"bag");
  assert.equal(await evaluate("document.querySelector('#category').value"),"Bags");
  assert.equal(await evaluate("document.querySelector('#sort').value"),"high");
  await expectIds([]);
  assert.ok(await evaluate(`document.querySelector('main').textContent.includes(${JSON.stringify(messages.ar.noResults)})`));
  await setSearch("حَقِيبَة");
  await expectIds([10,1,2,3]);
  await changeLanguage("en");
  await evaluate("document.querySelector('#shop-all').click()");
  await expectIds([1,2,3,4,5,6,7,8,9,10,11,12]);
  console.log("EN/AR/TR catalog text, alt text, prices, metadata, responsive directions, and filter-state retention passed without reload");

  await evaluate("document.querySelector('main [data-add=\"1\"]').click()");
  await waitFor("document.querySelector('#count').textContent === '1'");
  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  await evaluate("document.querySelector('#clear-cart').click()");
  await waitFor("document.activeElement.id === 'confirm-clear'");
  await evaluate("document.activeElement.dataset.focusProbe='kept'");
  const languageCartBefore = await evaluate("localStorage.getItem('shopboard-catalog-cart-v2')");
  for (const language of ["ar","tr","en"]) {
    await changeLanguage(language);
    assert.equal(await evaluate("document.querySelector('#cart').open"),true);
    assert.equal(await evaluate("document.activeElement.dataset.focusProbe"),"kept");
    assert.equal(await evaluate("document.querySelector('#cart-title').textContent"),messages[language].cartTitle);
    assert.equal(await evaluate("document.querySelector('#clear-question').textContent"),messages[language].clearQuestion);
    assert.equal(await evaluate("document.querySelector('#cart-total').textContent"),formatPrice(89,language));
    assert.equal(await evaluate("document.querySelector('#count').textContent"),formatNumber(1,language));
    assert.equal(await evaluate("localStorage.getItem('shopboard-catalog-cart-v2')"),languageCartBefore);
  }
  await evaluate("document.querySelector('#cancel-clear').click();document.querySelector('#close-cart').click()");
  await evaluate("document.querySelector('main a[href=\"/products/1\"]').click()");
  await waitFor("document.querySelector('#product-title')");
  await changeLanguage("tr");
  assert.equal(await evaluate("document.querySelector('#product-title').textContent"),products[0].translations.tr.name);
  await evaluate("document.querySelector('footer a[href=\"/signup\"]').click()");
  await waitFor("document.querySelector('#signup-email') && !document.querySelector('#signup-form fieldset').disabled");
  await fillSignup("signup-email","demo@example.test");
  await fillSignup("signup-password","demo-pass-123");
  for (const language of ["ar","en","tr"]) {
    await changeLanguage(language);
    assert.equal(await evaluate("document.querySelector('#signup-title').textContent"),messages[language].signupTitle);
    assert.equal(await evaluate("document.querySelector('#signup-email').value"),"demo@example.test");
    assert.equal(await evaluate("document.querySelector('#signup-password').value"),"demo-pass-123");
  }
  await evaluate("document.querySelector('#signup-form button').click()");
  await waitFor(`document.querySelector('#signup [role=status]').textContent === ${JSON.stringify(messages.tr.signupSuccess)}`);
  await changeLanguage("ar");
  assert.equal(await evaluate("document.querySelector('#signup [role=status]').textContent"),messages.ar.signupSuccess);
  console.log("Open cart/confirmation/focus, cart persistence, detail translations, signup values and active feedback survive language changes");

  await evaluate("document.querySelector('#open-cart').click()");
  await waitFor("document.querySelector('#cart').open");
  await evaluate("document.querySelector('#cart a[href=\"/checkout\"]').click()");
  await waitFor("document.querySelector('#checkout-fullName')");
  await fillCheckout("checkout-fullName","Demo Visitor");
  await evaluate("document.querySelector('main form button[type=submit]').click()");
  await waitFor("document.querySelector('#checkout-email-error')");
  for (const language of ["tr","en","ar"]) {
    await changeLanguage(language);
    assert.equal(await evaluate("document.querySelector('#checkout-fullName').value"),"Demo Visitor");
    assert.equal(await evaluate("document.querySelector('#checkout-email-error').textContent"),checkoutMessages[language].errors.email);
    assert.equal(await evaluate("document.querySelector('#checkout-form-title').textContent"),checkoutMessages[language].formTitle);
    assert.equal(await evaluate("document.querySelector('#checkout-email').dir"),"ltr");
    assert.equal(await evaluate("document.querySelector('#checkout-phone').dir"),"ltr");
  }
  await fillCheckout("checkout-email","demo@example.test");
  await fillCheckout("checkout-address","12 Demo Street");
  await fillCheckout("checkout-city","Demo City");
  await fillCheckout("checkout-postalCode","34000");
  await fillCheckout("checkout-country","Türkiye");
  await evaluate("document.querySelector('#checkout-demo').click();document.querySelector('main form button[type=submit]').click()");
  await waitFor("document.querySelector('#checkout-success-title')");
  await changeLanguage("tr");
  assert.equal(await evaluate("document.querySelector('#checkout-success-title').textContent"),checkoutMessages.tr.successTitle);
  assert.equal(await evaluate("document.querySelector('#count').textContent"),formatNumber(1,"tr"));
  await send("Page.reload",{ignoreCache:true});
  await waitFor("document.documentElement.lang === 'tr' && document.querySelector('#checkout-fullName')");
  assert.equal(await evaluate("document.querySelector('#language').value"),"tr");
  assert.equal(await evaluate("document.querySelector('#count').textContent"),formatNumber(1,"tr"));
  await evaluate("document.querySelector('#checkout-fullName').value");
  await send("Page.navigate",{url:origin + "/unknown-localized-page"});
  await waitFor(`document.documentElement.lang === 'tr' && document.querySelector('main h1')?.textContent === ${JSON.stringify(routeMessages.tr.notFound)}`);
  assert.ok(await evaluate(`document.querySelector('main').textContent.includes(${JSON.stringify(routeMessages.tr.notFoundDescription)})`));
  await changeLanguage("en");
  console.log("Translated checkout errors/values/success and saved language/cart restore after reload passed");
  await evaluate("localStorage.setItem('shopboard-language','constructor')");
  await send("Page.navigate",{url:origin + "/signup"});
  await waitFor("document.readyState === 'complete' && document.querySelector('#signup-form fieldset') && !document.querySelector('#signup-form fieldset').disabled");
  assert.equal(await evaluate("document.documentElement.lang"),"en");
  assert.equal(await evaluate("document.querySelector('#language').value"),"en");
  await evaluate("localStorage.setItem('shopboard-language','ar')");
  await send("Page.reload",{ignoreCache:true});
  await waitFor("document.documentElement.lang === 'ar' && document.querySelector('#language').value === 'ar'");
  assert.equal(await evaluate("document.querySelector('#signup-title').textContent"),messages.ar.signupTitle);
  await changeLanguage("en");
  const blockedLanguageStorage = await send("Page.addScriptToEvaluateOnNewDocument", {
    source:"Storage.prototype.getItem = function(){throw new Error('Storage blocked for language test')}; Storage.prototype.setItem = function(){throw new Error('Storage blocked for language test')};",
  });
  await send("Page.navigate",{url:origin + "/"});
  await waitFor("document.readyState === 'complete' && document.querySelector('#language')");
  assert.equal(await evaluate("document.documentElement.lang"),"en");
  await evaluate("document.querySelector('#language').value='ar';document.querySelector('#language').dispatchEvent(new Event('change',{bubbles:true}))");
  await waitFor("document.documentElement.lang === 'ar' && document.documentElement.dir === 'rtl'");
  await send("Page.removeScriptToEvaluateOnNewDocument",{identifier:blockedLanguageStorage.identifier});
  console.log("Invalid saved preferences, saved Arabic hydration, and blocked-storage language switching passed");

  await send("Page.navigate", {url:origin + "/"});
  await waitFor("document.querySelector('#hero-title') && document.querySelector('#product-search') && !document.querySelector('#open-cart').disabled");
  await evaluate("document.querySelector('#shop-all').click()");
  await waitFor("location.pathname === '/shop'");
  await send("Page.navigate", {url:origin + "/"});
  await waitFor("document.querySelector('.home-storefront #shop article')");
  assert.deepEqual(await evaluate("Array.from(document.querySelector('.home-storefront').children,element=>element.id)"),["hero","benefits","shop","signup","philosophy"]);
  assert.equal(await evaluate("document.querySelectorAll('main h1').length"),1);
  assert.equal(await evaluate("document.querySelectorAll('[id]').length === new Set(Array.from(document.querySelectorAll('[id]'),el=>el.id)).size"),true);
  await waitFor("document.querySelector('#hero img').complete && document.querySelector('#hero img').naturalWidth > 0");
  const homeTimeOrigin = await evaluate("performance.timeOrigin");
  for (const language of ["en","ar","tr"]) {
    await changeLanguage(language);
    assert.equal(await evaluate("document.querySelector('#hero-title span').textContent"),messages[language].heroFirst);
    assert.equal(await evaluate("document.querySelector('#hero img').alt"),messages[language].heroAlt);
    assert.equal(await evaluate("document.querySelector('#shop-title').textContent"),messages[language].shopTitle);
    assert.equal(await evaluate("document.querySelector('#philosophy-title').textContent"),messages[language].philosophyTitle);
    assert.equal(await evaluate("document.querySelector('#signup-title').textContent"),messages[language].signupTitle);
    assert.equal(await evaluate("performance.timeOrigin"),homeTimeOrigin);
    for (const width of [375,700,701,768,1100,1101,1440]) {
      await send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:false});
      await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))");
      const home = await evaluate(`(() => {
        const hero=document.querySelector('#hero'), image=hero.querySelector('img');
        const style=element=>getComputedStyle(element);
        const rect=element=>element.getBoundingClientRect();
        return { overflow:document.documentElement.scrollWidth>innerWidth,
          width:rect(hero).width, top:rect(hero).top-document.querySelector('header').getBoundingClientRect().bottom,
          columns:style(hero).gridTemplateColumns.split(' ').length,
          benefits:style(document.querySelector('#benefits')).gridTemplateColumns.split(' ').length,
          controls:style(document.querySelector('#product-search').closest('label').parentElement).gridTemplateColumns.split(' ').length,
          square:Math.abs(rect(image).width-rect(image).height)<1, fit:style(image).objectFit,
          imageRight:rect(image).left>rect(hero.firstElementChild).left,
          philosophyPadding:style(document.querySelector('#philosophy')).paddingTop };
      })()`);
      assert.equal(home.overflow,false);
      assert.equal(home.width,width-2*(width<701?18:width<1101?32:56));
      assert.ok(Math.abs(home.top-(width<701?18:12))<1);
      assert.equal(home.columns,width<701?1:2);
      assert.equal(home.benefits,width<701?2:4);
      assert.equal(home.controls,width<701?1:width<1101?2:3);
      assert.equal(home.square,true);
      assert.equal(home.fit,"contain");
      if(width>=701) assert.equal(home.imageRight,language!=="ar");
      assert.equal(home.philosophyPadding,width<701?"48px":"64px");
      if([375,768,1440].includes(width)) console.log(`Home sections passed: ${language}, ${width}px`);
    }
  }
  await changeLanguage("en");
  await evaluate("document.querySelector('#hero a[href=\"#shop\"]').click()");
  await waitFor("location.hash === '#shop'");
  await setSearch("belt");
  await expectIds([12]);
  const homeCountBefore=await evaluate("Number(document.querySelector('#count').textContent)");
  await evaluate("document.querySelector('main [data-add=\"12\"]').click()");
  await waitFor(`Number(document.querySelector('#count').textContent) === ${homeCountBefore+1}`);
  await fillSignup("signup-email","home@example.test");
  await fillSignup("signup-password","home-pass-123");
  await changeLanguage("ar");
  assert.equal(await evaluate("document.querySelector('#signup-email').value"),"home@example.test");
  assert.equal(await evaluate("document.querySelector('#product-search').value"),"belt");
  await changeLanguage("en");
  await evaluate("document.querySelector('#signup-form button').click()");
  await waitFor(`document.querySelector('#signup [role=status]').textContent === ${JSON.stringify(messages.en.signupSuccess)}`);
  await evaluate("document.querySelector('footer a[href=\"/shop\"]').click()");
  await waitFor("location.pathname === '/shop' && document.querySelector('#product-search')");
  assert.equal(await evaluate("document.querySelector('#product-search').value"),"belt");
  assert.equal(await evaluate("document.querySelector('.home-storefront')"),null);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('main')).paddingTop"),"48px");
  console.log("Home CTA, shared filtering/cart/signup, language state and unchanged shop presentation passed");
  await send("Network.setCacheDisabled",{cacheDisabled:true});
  await send("Network.setBlockedURLs",{urls:["*yaninda-campaign*"]});
  await send("Page.navigate",{url:origin+"/"});
  await waitFor("document.querySelector('#hero img')?.getAttribute('src') === '/images/products/fallback.svg'");
  await send("Network.setBlockedURLs",{urls:["*yaninda-campaign*","*fallback.svg*"]});
  await send("Page.reload",{ignoreCache:true});
  await waitFor("document.querySelector('#hero [role=status]')");
  assert.equal(await evaluate("document.querySelector('#hero img')"),null);
  await send("Network.setBlockedURLs",{urls:[]});
  console.log("Campaign image fallback and translated exhausted-image status passed");

  await send("Page.navigate",{url:origin+"/about"});
  await waitFor("document.querySelector('[data-about-page] #philosophy-title') && !document.querySelector('#open-cart').disabled");
  const aboutTimeOrigin=await evaluate("performance.timeOrigin");
  for(const language of ["en","ar","tr"]) {
    await changeLanguage(language);
    assert.equal(await evaluate("document.querySelector('main h1').textContent"),routeMessages[language].about);
    assert.equal(await evaluate("document.querySelector('#philosophy-title').textContent"),messages[language].philosophyTitle);
    assert.equal(await evaluate("document.querySelector('#philosophy p').textContent"),messages[language].philosophyText);
    assert.equal(await evaluate("document.querySelector('#philosophy a span').textContent"),messages[language].discover);
    assert.equal(await evaluate("performance.timeOrigin"),aboutTimeOrigin);
    for(const width of [375,700,701,768,1101,1440]) {
      await send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:false});
      await evaluate("document.fonts.ready.then(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true)))))");
      const about=await evaluate(`(() => {
        const title=document.querySelector('main h1'), panel=document.querySelector('#philosophy'), action=panel.querySelector('a');
        const rect=element=>element.getBoundingClientRect(), style=element=>getComputedStyle(element);
        return {overflow:document.documentElement.scrollWidth>innerWidth,
          width:rect(panel).width, titleTop:rect(title).top-rect(document.querySelector('header')).bottom,
          titleSize:parseFloat(style(title).fontSize), titleFont:style(title).fontFamily,
          titleSpacing:parseFloat(style(title).letterSpacing)||0, titleColor:style(title).color,
          panelGap:rect(panel).top-rect(title).bottom, radius:style(panel).borderRadius,
          padding:style(panel).paddingTop, ribbonWidth:rect(panel.querySelector('svg')).width,
          paths:panel.querySelectorAll('svg path').length,
          actionBackground:style(action).backgroundColor, actionColor:style(action).color,
          actionDisplay:style(action).display, actionRadius:style(action).borderRadius,
          actionHeight:rect(action).height, href:action.getAttribute('href'),
          headings:document.querySelectorAll('main h1').length };
      })()`);
      assert.equal(about.overflow,false);
      assert.equal(about.width,width-2*(width<701?18:width<1101?32:56));
      assert.ok(Math.abs(about.titleTop-(width<701?22:30))<1);
      assert.ok(Math.abs(about.titleSize-(width<701?57:Math.min(78,Math.max(48,width*0.052))))<0.1);
      assert.match(about.titleFont,language==="ar"?/Noto/i:/Manrope/i);
      assert.equal(about.titleSpacing,language==="ar"?0:width>=1101?-4:-3);
      assert.equal(about.titleColor,"rgb(107, 44, 44)");
      assert.ok(Math.abs(about.panelGap-38)<1);
      assert.equal(about.radius,"16px");
      assert.equal(about.padding,width<701?"48px":"64px");
      assert.equal(about.ribbonWidth,40);
      assert.equal(about.paths,4);
      assert.equal(about.actionBackground,"rgb(107, 44, 44)");
      assert.equal(about.actionColor,"rgb(248, 241, 231)");
      assert.equal(about.actionDisplay,"inline-flex");
      assert.equal(about.actionRadius,"8px");
      assert.ok(about.actionHeight>=46);
      assert.equal(about.href,"#shop");
      assert.equal(about.headings,1);
      if([375,768,1440].includes(width)) console.log(`About parity passed: ${language}, ${width}px`);
    }
  }
  await changeLanguage("en");
  const sharedPhilosophy=await evaluate("document.querySelector('#philosophy').outerHTML");
  await evaluate("document.querySelector('#philosophy a').focus()");
  assert.equal(await evaluate("document.activeElement === document.querySelector('#philosophy a')"),true);
  await evaluate("document.querySelector('#philosophy a').click()");
  await waitFor("location.pathname === '/about' && location.hash === '#shop'");
  await send("Page.navigate",{url:origin+"/"});
  await waitFor("document.querySelector('.home-storefront #philosophy-title') && document.documentElement.lang === 'en'");
  await waitFor("document.readyState === 'complete'");
  await evaluate("document.fonts.ready.then(()=>true)");
  assert.equal(await evaluate("document.querySelector('#philosophy').outerHTML"),sharedPhilosophy);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#hero a')).backgroundColor"),"rgb(107, 44, 44)");
  console.log("About discovery hash, focusability, and identical shared Philosophy markup on home passed");

  await send("Page.navigate",{url:origin+"/shipping"});
  await waitFor("document.readyState === 'complete' && document.querySelector('[data-shipping-page]') && !document.querySelector('#open-cart').disabled");
  const shippingTimeOrigin=await evaluate("performance.timeOrigin");
  const shippingCart=await evaluate("localStorage.getItem('shopboard-catalog-cart-v2')");
  for(const language of ["en","ar","tr"]) {
    await changeLanguage(language);
    const copy=routeMessages[language];
    for(const [selector,text] of [
      ["#shipping-title",copy.shipping],
      ["[data-shipping-page] > div:first-child > span",copy.shippingEyebrow],
      ["[data-shipping-cards] section:first-child h2",copy.shippingThreshold],
      ["[data-shipping-cards] section:first-child p",copy.shippingDescription],
      ["[data-shipping-cards] section:last-child h2",copy.shippingCurrency],
      ["[data-shipping-cards] section:last-child p",copy.shippingCurrencyDescription],
      ["#shipping-availability",copy.shippingAvailability],
      ["[data-shipping-page] aside p",copy.shippingDemo],
      ["[data-shipping-page] aside a",copy.shop],
    ]) assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector)}).textContent.trim()`),text);
    assert.equal(await evaluate("performance.timeOrigin"),shippingTimeOrigin);
    assert.equal(await evaluate("localStorage.getItem('shopboard-catalog-cart-v2')"),shippingCart);
    for(const width of [375,700,701,768,1101,1440]) {
      await send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:false});
      await evaluate("document.fonts.ready.then(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true)))))");
      const shipping=await evaluate(`(() => {
        const page=document.querySelector('[data-shipping-page]'), grid=page.querySelector('[data-shipping-cards]');
        const cards=Array.from(grid.children), note=page.querySelector('aside');
        const style=element=>getComputedStyle(element), rect=element=>element.getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth>innerWidth,
          width:rect(page).width, top:rect(page).top-rect(document.querySelector('header')).bottom,
          columns:style(grid).gridTemplateColumns.split(' ').length,gap:style(grid).gap,
          cardPadding:parseFloat(style(cards[0]).paddingTop),border:style(cards[0]).borderTopWidth,
          borderColor:style(cards[0]).borderTopColor,radius:style(cards[0]).borderRadius,
          background:style(cards[0]).backgroundColor,noteBackground:style(note).backgroundColor,
          noteGap:rect(note).top-rect(grid).bottom, titleSize:parseFloat(style(page.querySelector('h1')).fontSize),
          titleFont:style(page.querySelector('h1')).fontFamily,
          paragraphLine:parseFloat(style(cards[0].querySelector('p')).lineHeight),
          titleLine:parseFloat(style(page.querySelector('h1')).lineHeight),
          cardOrder:rect(cards[0]).left<rect(cards[1]).left,
          numbers:cards.map(card=>({text:card.querySelector('span').textContent,hidden:card.querySelector('span').getAttribute('aria-hidden')})),
          href:note.querySelector('a').getAttribute('href'), color:style(note.querySelector('a')).color,
          decoration:style(note.querySelector('a')).textDecorationLine };
      })()`);
      assert.equal(shipping.overflow,false);
      assert.equal(shipping.width,width-2*(width<701?18:width<1101?32:56));
      assert.ok(Math.abs(shipping.top-Math.min(72,Math.max(32,width*0.06)))<1);
      assert.equal(shipping.columns,width<701?1:2);
      assert.equal(shipping.gap,"20px");
      assert.ok(Math.abs(shipping.cardPadding-Math.min(48,Math.max(24,width*0.04)))<0.1);
      assert.equal(shipping.border,"1px");
      assert.equal(shipping.radius,"16px");
      assert.notEqual(shipping.background,"rgba(0, 0, 0, 0)");
      assert.equal(shipping.noteBackground,"rgba(0, 0, 0, 0)");
      assert.ok(Math.abs(shipping.noteGap-24)<1);
      const titleSize=language==="ar"?Math.min(42,Math.max(28,width*0.04)):Math.min(58,Math.max(36,width*0.05));
      assert.ok(Math.abs(shipping.titleSize-titleSize)<0.1);
      assert.match(shipping.titleFont,language==="ar"?/Noto/i:/Cormorant/i);
      assert.ok(Math.abs(shipping.titleLine-titleSize*(language==="ar"?1.6:1.15))<0.1);
      assert.equal(shipping.paragraphLine,language==="ar"?30:27.75);
      if(width>=701) assert.equal(shipping.cardOrder,language!=="ar");
      assert.deepEqual(shipping.numbers,[{text:"01",hidden:"true"},{text:"02",hidden:"true"}]);
      assert.equal(shipping.href,"/shop");
      assert.equal(shipping.color,"rgb(107, 44, 44)");
      assert.equal(shipping.decoration,"underline");
      if([375,768,1440].includes(width)) console.log(`Shipping parity passed: ${language}, ${width}px`);
    }
  }
  await changeLanguage("en");
  await evaluate("document.querySelector('[data-shipping-page] aside a').focus()");
  assert.equal(await evaluate("document.activeElement === document.querySelector('[data-shipping-page] aside a')"),true);
  await evaluate("document.querySelector('[data-shipping-page] aside a').click()");
  await waitFor("location.pathname === '/shop' && document.querySelector('#product-search') && document.readyState === 'complete'");
  assert.equal(await evaluate("location.search"),"");
  assert.equal(await evaluate("localStorage.getItem('shopboard-catalog-cart-v2')"),shippingCart);
  assert.equal(await evaluate("document.querySelector('[data-shipping-page]')"),null);
  console.log("Shipping translations, RTL card order, focusable shop CTA and retained cart passed");

  for(const language of ["en","ar","tr"]) {
    await changeLanguage(language);
    assert.equal(await evaluate("document.querySelector('[data-collection-introduction] span').textContent"),messages[language].shopEyebrow);
    assert.equal(await evaluate("document.querySelector('[data-collection-introduction] p').textContent"),messages[language].shopDescription);
    for(const width of [375,700,701,768,1100,1101,1440]) {
      await send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:false});
      await evaluate("document.fonts.ready.then(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true)))))");
      const shop=await evaluate(`(() => {
        const intro=document.querySelector('[data-collection-introduction]'), controls=document.querySelector('[data-catalog-controls]');
        const search=document.querySelector('#product-search'), label=search.closest('label'), category=document.querySelector('#category');
        const style=element=>getComputedStyle(element), rect=element=>element.getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth>innerWidth,
          introColumns:style(intro).gridTemplateColumns.split(' ').length,
          divider:style(intro).borderBottomWidth, bottom:style(intro).paddingBottom,
          controls:style(controls).gridTemplateColumns.split(' ').length,
          searchWidth:rect(label).width, controlsWidth:rect(controls).width,
          searchHeight:rect(label).height, icon:rect(label.querySelector('svg')).width,
          border:style(label).borderTopColor, categoryBorder:style(category).borderTopColor,
          categoryHeight:rect(category).height, categorySize:style(category).fontSize,
          titleSize:parseFloat(style(intro.querySelector('h1')).fontSize), titleLine:parseFloat(style(intro.querySelector('h1')).lineHeight),
          descriptionSize:style(intro.querySelector('p')).fontSize,
          descriptionLine:style(intro.querySelector('p')).lineHeight };
      })()`);
      assert.equal(shop.overflow,false);
      assert.equal(shop.introColumns,width<701?1:2);
      assert.equal(shop.divider,"1px");assert.equal(shop.bottom,"28px");
      assert.equal(shop.controls,width<701?1:width<1101?2:3);
      if(width<1101) assert.ok(Math.abs(shop.searchWidth-shop.controlsWidth)<1);
      assert.ok(shop.searchHeight>=46);assert.equal(shop.icon,18);
      assert.equal(shop.border,"rgb(139, 107, 74)");assert.equal(shop.categoryBorder,shop.border);
      assert.ok(shop.categoryHeight>=48);assert.equal(shop.categorySize,"16px");
      const size=language==="ar"?Math.min(42,Math.max(28,width*0.04)):Math.min(58,Math.max(36,width*0.05));
      assert.ok(Math.abs(shop.titleSize-size)<0.1);
      assert.ok(Math.abs(shop.titleLine-size*(language==="ar"?1.6:1.15))<0.1);
      assert.equal(shop.descriptionSize,"15px");assert.equal(shop.descriptionLine,language==="ar"?"30px":"27.75px");
      if([375,768,1440].includes(width)) console.log(`Shop visual parity passed: ${language}, ${width}px`);
    }
    await setSearch("zzzz-no-products");
    await waitFor("document.querySelector('[data-catalog-empty]')");
    assert.equal(await evaluate("document.querySelector('[data-catalog-empty] p').textContent"),messages[language].noResults);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-catalog-empty]')).borderRadius"),"16px");
    assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-catalog-empty] a')).backgroundColor"),"rgb(107, 44, 44)");
    await evaluate("document.querySelector('[data-catalog-empty] button').click()");
    await expectIds([1,2,3,4,5,6,7,8,9,10,11,12]);
  }
  console.log("Shop empty-state presentation and combined-filter recovery passed in EN/AR/TR");

  if(process.env.SHOPBOARD_TEST_DELAY_ORIGIN) {
    for(const language of ["ar","tr"]) {
      const preferenceScript=await send("Page.addScriptToEvaluateOnNewDocument",{source:`localStorage.setItem('shopboard-language',${JSON.stringify(language)})`});
      try {
        for(const path of ["/","/shop"]) {
          await send("Page.navigate",{url:process.env.SHOPBOARD_TEST_DELAY_ORIGIN+path});
          await waitFor(`document.readyState === 'complete' && document.querySelector('main article') && document.documentElement.lang === ${JSON.stringify(language)}`);
          await waitFor("!document.querySelector('main [data-add]').disabled");
          assert.equal(await evaluate("document.querySelector('label[for=product-search] .sr-only').textContent"),messages[language].search);
          assert.equal(await evaluate("document.querySelector('main article h2 a').textContent"),products[0].translations[language].name);
          console.log(`Saved ${language} preference and delayed streamed catalog passed: ${path}`);
        }
      } finally {
        await send("Page.removeScriptToEvaluateOnNewDocument",{identifier:preferenceScript.identifier});
      }
    }
  }

  // Optional production servers using the existing fail/empty API scenarios.
  for(const [status,scenarioOrigin] of [["error",process.env.SHOPBOARD_TEST_FAILURE_ORIGIN],["empty",process.env.SHOPBOARD_TEST_EMPTY_ORIGIN]]) {
    if(!scenarioOrigin) continue;
    await send("Page.navigate",{url:scenarioOrigin+"/shop"});
    await waitFor("document.readyState === 'complete' && document.querySelector('[data-catalog-fallback]') && !document.querySelector('#open-cart').disabled");
    assert.equal(await evaluate("document.querySelectorAll('main article').length"),12);
    await setSelect("category","Bags");
    await setSelect("sort","low");
    for(const language of ["en","ar","tr"]) {
      await changeLanguage(language);
      assert.equal(await evaluate("document.querySelector('[data-catalog-fallback] > p').textContent"),catalogMessages[language][status]);
      assert.equal(await evaluate("document.querySelector('[data-catalog-fallback] > p').getAttribute('role')"),status==="error"?"alert":"status");
      assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-catalog-fallback]')).borderRadius"),"16px");
      const countBeforeRetry=browserRequests.length;
      await evaluate("document.querySelector('[data-catalog-fallback] button').click()");
      const retryDeadline=Date.now()+15000;
      while(!browserRequests.slice(countBeforeRetry).some(request=>request.url.startsWith(scenarioOrigin+"/shop")&&request.url.includes("_rsc="))) {
        assert.ok(Date.now()<retryDeadline,"Retry must request a new server component payload");
        await new Promise(resolve=>setTimeout(resolve,100));
      }
      await waitFor("!document.querySelector('[data-catalog-fallback] button').disabled");
      assert.equal(await evaluate("document.querySelector('#category').value"),"Bags");
      assert.equal(await evaluate("document.querySelector('#sort').value"),"low");
      assert.equal(await evaluate("document.querySelectorAll('main article').length"),4);
    }
    console.log(`Shop ${status} fallback, translations, retained products and server retry passed`);
  }
  assert.equal(browserErrors.some(error => /hydration|hydrating|#418|#425/i.test(error)), false, browserErrors.filter(error => /hydration|hydrating|#418|#425/i.test(error)).join("\n"));
  console.log("No hydration errors observed");
} finally {
  ws.close();
}
