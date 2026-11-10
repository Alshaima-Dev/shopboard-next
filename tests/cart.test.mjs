import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/features/products/product-data.ts";
import { createCartStore, MAX_CART_QUANTITY } from "../src/features/cart/cart-store.ts";
import { calculateCartCount, calculateCartTotal } from "../src/features/cart/cart-logic.ts";
import { createCartController } from "../src/features/cart/cart-controller.ts";

const key = "shopboard-catalog-cart-v2";
function memoryStorage(value = "{}") {
  const values = new Map([[key, value]]);
  let writes = 0;
  return {
    values, get writes() { return writes; },
    getItem: name => values.get(name) ?? null,
    setItem(name, value) { writes++; values.set(name, value); },
  };
}

test("original cart storage format, quantities, count, total, and copies are preserved", () => {
  const storage = memoryStorage('{"1":2,"8":1}');
  const store = createCartStore(products, storage);
  assert.equal(MAX_CART_QUANTITY, 99);
  assert.deepEqual(store.getCart(), {1:2, 8:1});
  assert.equal(calculateCartCount(store.getCart()), 3);
  assert.equal(calculateCartTotal(products, store.getCart()), 328);
  store.changeQuantity(1, -1);
  store.removeItem(8);
  store.addItem(3);
  assert.deepEqual(JSON.parse(storage.values.get(key)), {1:1, 3:1});
  const copy = store.getCart();
  copy[1] = 90;
  assert.equal(store.getCart()[1], 1);
  store.clearCart();
  assert.equal(storage.values.get(key), "{}");
  assert.deepEqual([...storage.values.keys()], [key]);
});

test("saved quantities validate IDs and numeric integers, clamp to 99, and remove at zero", () => {
  const store = createCartStore(products, memoryStorage('{"1":200,"2":-1,"3":1.5,"4":"2","999":4}'));
  assert.deepEqual(store.getCart(), {1:99});
  store.addItem(1);
  store.addItem(999);
  store.changeQuantity(2, 1.5);
  assert.deepEqual(store.getCart(), {1:99});
  store.changeQuantity(1, -99);
  assert.deepEqual(store.getCart(), {});
});

test("corrupt, blocked, and quota-exhausted storage do not prevent in-memory shopping", () => {
  for (const storage of [
    memoryStorage("{bad JSON"),
    {getItem() {throw Error("blocked");}, setItem() {throw Error("quota");}},
  ]) {
    const store = createCartStore(products, storage);
    assert.deepEqual(store.getCart(), {});
    store.addItem(1);
    assert.deepEqual(store.getCart(), {1:1});
    store.changeQuantity(1, -1);
    assert.deepEqual(store.getCart(), {});
  }
});

test("SSR snapshot is empty and stable; hydration restores once without overwriting saved data", () => {
  const storage = memoryStorage('{"2":2}');
  const controller = createCartController(products);
  const server = controller.getServerSnapshot();
  assert.equal(server.ready, false);
  assert.deepEqual(server.quantities, {});
  assert.equal(storage.writes, 0);
  controller.restoreStorage(storage);
  assert.equal(controller.getSnapshot().ready, true);
  assert.deepEqual(controller.getSnapshot().quantities, {2:2});
  assert.equal(storage.writes, 0);
  assert.equal(controller.getServerSnapshot(), server);
  controller.restoreStorage(memoryStorage('{"1":99}'));
  assert.deepEqual(controller.getSnapshot().quantities, {2:2});
  controller.addItem(1);
  assert.deepEqual(JSON.parse(storage.values.get(key)), {1:1, 2:2});
  const restored = createCartController(products);
  restored.restoreStorage(storage);
  assert.deepEqual(restored.getSnapshot().quantities, {1:1, 2:2});
});

test("controllers are isolated and subscribers share immutable snapshots", () => {
  const first = createCartController(products);
  const second = createCartController(products);
  first.restoreStorage(null);
  second.restoreStorage(null);
  let calls = 0;
  const stop = first.subscribe(() => calls++);
  const before = first.getSnapshot();
  first.addItem(1);
  assert.equal(calls, 1);
  assert.deepEqual(second.getSnapshot().quantities, {});
  assert.deepEqual(before.quantities, {});
  assert.throws(() => { first.getSnapshot().quantities[1] = 9; }, TypeError);
  stop();
  first.addItem(1);
  assert.equal(calls, 1);
});

test("updated validated product data updates totals without losing cart quantities", () => {
  const controller = createCartController(products);
  controller.restoreStorage(memoryStorage('{"1":2,"8":1}'));
  controller.registerProducts([{...products[0], price:100}]);
  const snapshot = controller.getSnapshot();
  assert.deepEqual(snapshot.quantities, {1:2, 8:1});
  assert.equal(calculateCartTotal(snapshot.catalog, snapshot.quantities), 350);
  controller.registerProducts([{...products[0], id:999}]);
  assert.equal(controller.getSnapshot().catalog.length, 12);
  assert.equal(controller.getSnapshot().catalog.some(p => p.id === 999), false);
});

test("clear confirmation, cancellation, empty reset, and feedback match original behavior", () => {
  const controller = createCartController(products);
  controller.restoreStorage(null);
  controller.addItem(1);
  assert.equal(controller.getSnapshot().notice.key, "added");
  controller.open();
  controller.requestClear();
  controller.cancelClear();
  assert.equal(controller.getSnapshot().confirmClear, false);
  assert.deepEqual(controller.getSnapshot().quantities, {1:1});
  controller.requestClear();
  controller.close();
  controller.open();
  assert.equal(controller.getSnapshot().confirmClear, false);
  controller.requestClear();
  controller.confirmClearCart();
  assert.deepEqual(controller.getSnapshot().quantities, {});
  assert.equal(controller.getSnapshot().confirmClear, false);
  assert.equal(controller.getSnapshot().isOpen, true);
  assert.equal(controller.getSnapshot().notice.key, "cleared");
  controller.addItem(2);
  controller.changeQuantity(2, -1);
  assert.deepEqual(controller.getSnapshot().quantities, {});
  controller.addItem(1);
  controller.removeItem(1);
  assert.equal(controller.getSnapshot().notice.key, "removed");
});
