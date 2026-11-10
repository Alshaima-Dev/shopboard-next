import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/features/products/product-data.ts";
import { fetchCompleteProducts, isProduct } from "../src/features/products/products-api.ts";
import { fetchProductById } from "../src/features/products/product-details-api.ts";
import { loadProductCatalog } from "../src/features/products/product-catalog.ts";
import { API_BASE_URL, DEFAULT_API_TIMEOUT_MS, buildApiUrl, getApiScenario, fetchJson } from "../src/lib/api/client.ts";

const response = (body, status = 200) => new Response(JSON.stringify(body), { status });

test("fallback is the original complete, translated, unique 12-product catalog", () => {
  assert.equal(products.length, 12);
  assert.equal(new Set(products.map(p => p.id)).size, 12);
  assert.deepEqual([...new Set(products.map(p => p.category))].sort(), ["Accessories", "Bags", "Shoes"]);
  for (const product of products) {
    assert.ok(isProduct(product));
    assert.match(product.image, /^images\/products\/.+\.jpg$/);
    for (const lang of ["en", "ar", "tr"]) assert.ok(product.translations[lang].description);
  }
});

test("runtime product validation rejects invalid fields and incomplete translations", () => {
  for (const changes of [{id: 0}, {id: 1.5}, {price: -1}, {price: Infinity}, {category: "Other"}, {translations: {}}, {image: null}, {name: 1}]) {
    assert.equal(isProduct({...products[0], ...changes}), false);
  }
});

test("complete valid remote data replaces fallback with exactly one uncached request", async () => {
  let calls = 0;
  const updated = products.map(p => ({...p, price: p.price + 1}));
  const catalog = await loadProductCatalog({
    fetcher: async (url, init) => {
      calls++;
      assert.equal(url, API_BASE_URL + "/api/products");
      assert.equal(init.cache, "no-store");
      assert.ok(init.signal);
      return response(updated);
    },
  });
  assert.equal(calls, 1);
  assert.equal(catalog.status, "ready");
  assert.deepEqual(catalog.products, updated);
  assert.equal(products[0].price, 89);
});

test("partial, empty, duplicate, foreign-ID and malformed catalogs never replace valid local data", async () => {
  for (const body of [[], products.slice(0, 1), [...products.slice(0, -1), products[0]], products.map(p => ({...p, id: p.id + 100})), [{id: 1}], {products}]) {
    const catalog = await loadProductCatalog({fetcher: async () => response(body)});
    assert.equal(catalog.products, products);
    assert.equal(catalog.status, Array.isArray(body) && body.length === 0 ? "empty" : "error");
  }
});

test("HTTP, network, invalid JSON, and timeout retain fallback and classify errors", async () => {
  const aborting = (_, init) => new Promise((_, reject) => {
    init.signal.addEventListener("abort", () => reject(Error("aborted")), {once: true});
  });
  for (const [fetcher, error] of [
    [async () => response({}, 503), "http"],
    [async () => {throw Error("offline");}, "network"],
    [async () => new Response("invalid JSON"), "invalid-response"],
    [aborting, "timeout"],
  ]) {
    const result = await fetchCompleteProducts(products, {fetcher, timeoutMs: 10});
    assert.equal(result.ok, false);
    assert.equal(result.error, error);
    const catalog = await loadProductCatalog({fetcher, timeoutMs: 10});
    assert.equal(catalog.status, "error");
    assert.equal(catalog.products, products);
  }
});

test("timeout also covers response body consumption", async () => {
  const result = await fetchCompleteProducts(products, {
    timeoutMs: 10,
    fetcher: async (_, init) => new Response(new ReadableStream({
      start(controller) {
        init.signal.addEventListener("abort", () => controller.error(Error("aborted")), {once: true});
      },
    })),
  });
  assert.deepEqual(result, {ok: false, error: "timeout"});
});

test("details makes one request; invalid IDs and 404s are missing, never substituted", async () => {
  let calls = 0;
  const result = await fetchProductById("1", {fetcher: async url => {
    calls++;
    assert.equal(url, API_BASE_URL + "/api/products/1");
    return response(products[0]);
  }});
  assert.equal(calls, 1);
  assert.deepEqual(result, {status: "ready", product: products[0]});
  for (const id of ["", "0", "-1", "1.5", "abc", "1e2", "9007199254740992"]) {
    assert.deepEqual(await fetchProductById(id, {fetcher: () => assert.fail("must not fetch")}), {status: "missing"});
  }
  assert.deepEqual(await fetchProductById("999999", {fetcher: async () => response({}, 404)}), {status: "missing"});
});

test("detail errors remain errors instead of producing false 404s", async () => {
  for (const body of [{}, [], {...products[0], id: 2}, {...products[0], translations: {}}]) {
    assert.deepEqual(await fetchProductById("1", {fetcher: async () => response(body)}), {status: "error"});
  }
  for (const fetcher of [async () => response({}, 500), async () => new Response("bad JSON"), async () => {throw Error("offline");}]) {
    assert.deepEqual(await fetchProductById("1", {fetcher}), {status: "error"});
  }
});

test("normal, delay, fail, and empty scenario prefixes apply to both endpoints", async () => {
  assert.equal(DEFAULT_API_TIMEOUT_MS, 5000);
  assert.equal(getApiScenario("unexpected"), "normal");
  for (const [scenario, prefix] of Object.entries({normal: "", delay: "/delay/3000", fail: "/fail/500", empty: "/empty"})) {
    for (const endpoint of ["/api/products", "api/products/1"]) {
      assert.equal(buildApiUrl(endpoint, getApiScenario(scenario)), API_BASE_URL + prefix + "/" + endpoint.replace(/^\/+/, ""));
    }
    await fetchProductById("1", {scenario: getApiScenario(scenario), fetcher: async url => {
      assert.equal(url, API_BASE_URL + prefix + "/api/products/1");
      return response(products[0]);
    }});
  }
  await assert.rejects(fetchJson("/api/products", {scenario: "fail", fetcher: async () => response({}, 500)}), {name: "ApiHttpError", status: 500});
});

test("delayed fetching stays pending until data arrives", async () => {
  let finish;
  let settled = false;
  const pending = loadProductCatalog({scenario: "delay", fetcher: () => new Promise(resolve => {finish = resolve;})}).then(result => {settled = true; return result;});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(settled, false);
  finish(response(products));
  assert.equal((await pending).status, "ready");
});

test("retry button invokes the framework retry callback", async () => {
  const { readFile } = await import("node:fs/promises");
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const ts = require("typescript");
  const code = await readFile(new URL("../src/features/products/product-error.tsx", import.meta.url), "utf8");
  const compiled = ts.transpileModule(code, {compilerOptions: {jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS}});
  const exports = {};
  const { routeMessages } = await import("../src/features/i18n/route-messages.ts");
  const componentRequire = name => name === "../i18n/language-provider"
    ? {useLocalization: () => ({route: routeMessages.en})}
    : require(name);
  new Function("require", "exports", compiled.outputText)(componentRequire, exports);
  let retries = 0;
  const tree = exports.ProductError({retry: () => {retries++;}});
  const button = tree.props.children.find(child => child.type === "button");
  assert.equal(button.props.type, "button");
  button.props.onClick();
  assert.equal(retries, 1);
});
