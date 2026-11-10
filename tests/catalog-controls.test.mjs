import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/features/products/product-data.ts";
import { getCategories, searchProducts, selectProducts, sortByPrice, AFFORDABLE_PRICE_LIMIT } from "../src/features/products/product-logic.ts";
import { createCatalogControls, catalogControlsReducer } from "../src/features/products/catalog-state.ts";
import { loadProductCatalog } from "../src/features/products/product-catalog.ts";

test("search preserves trimming, case folding, and localized product-name matching", () => {
  assert.deepEqual(searchProducts(products, "  LEATHER  ").map(p => p.id), [1, 12]);
  assert.equal(searchProducts(products, "").length, 12);
  assert.deepEqual(searchProducts(products, "حَقِيبَة", "ar").map(p => p.id), [1, 2, 3, 10]);
  assert.deepEqual(searchProducts(products, "DERİ", "tr").map(p => p.id), [1, 12]);
  assert.deepEqual(searchProducts(products, "no-such-product"), []);
});

test("search, category, price mode, and sorting compose without mutating products", () => {
  const original = structuredClone(products);
  assert.deepEqual(selectProducts(products, {query: "bag", category: "Bags", affordableOnly: true, sort: "high"}).map(p => p.id), [3]);
  assert.deepEqual(selectProducts(products, {category: "Accessories", affordableOnly: true, sort: "low"}).map(p => p.id), [7, 12, 9]);
  assert.deepEqual(sortByPrice(products, "featured"), products);
  assert.equal(sortByPrice(products, "low")[0].id, 7);
  assert.equal(sortByPrice(products, "high")[0].id, 8);
  assert.deepEqual(products, original);
  assert.deepEqual(getCategories(products), ["Bags", "Shoes", "Accessories"]);
});

test("affordable means strictly less than 50, including when composed with other controls", () => {
  assert.equal(AFFORDABLE_PRICE_LIMIT, 50);
  const boundaryProducts = [49.99, 50, 50.01].map((price, index) => ({...products[0], id: index + 1, price}));
  assert.deepEqual(selectProducts(boundaryProducts, {affordableOnly: true}).map(p => p.price), [49.99]);
  assert.deepEqual(selectProducts(products, {affordableOnly: true}).map(p => p.id), [2, 3, 7, 9, 12]);
});

test("control changes preserve one another; choosing either catalog mode resets all controls", () => {
  let state = createCatalogControls();
  state = catalogControlsReducer(state, {type: "query", value: "bag"});
  state = catalogControlsReducer(state, {type: "category", value: "Bags"});
  state = catalogControlsReducer(state, {type: "sort", value: "high"});
  assert.deepEqual(state, {query: "bag", category: "Bags", sort: "high", affordableOnly: false});
  for (const affordableOnly of [true, false]) {
    const next = catalogControlsReducer(state, {type: "mode", affordableOnly});
    assert.deepEqual(next, {...createCatalogControls(), affordableOnly});
    assert.equal(state.query, "bag");
  }
});

test("failed, empty, and partial API responses leave the fallback fully filterable", async () => {
  for (const [body, status] of [[{}, 500], [[], 200], [products.slice(0, 1), 200]]) {
    const catalog = await loadProductCatalog({
      fetcher: async () => new Response(JSON.stringify(body), {status}),
    });
    assert.equal(catalog.products, products);
    assert.deepEqual(selectProducts(catalog.products, {
      category: "Accessories", affordableOnly: true, sort: "high",
    }).map(p => p.id), [9, 12, 7]);
  }
});
