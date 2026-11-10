import type { MessageKey } from "../i18n/i18n.ts";
import type { Product } from "../products/product-types.ts";
import type { Cart, CartStorage } from "./cart-types.ts";
import { createCartStore } from "./cart-store.ts";
import { cartDialogReducer, initialCartDialogState } from "./cart-dialog-state.ts";

export interface CartSnapshot {
  quantities: Readonly<Cart>;
  catalog: readonly Product[];
  ready: boolean;
  isOpen: boolean;
  confirmClear: boolean;
  notice: { sequence: number; key: MessageKey } | null;
}

// Every provider owns its controller. No browser access during SSR/render.
export function createCartController(initialCatalog: readonly Product[]) {
  let catalog = initialCatalog;
  let store = createCartStore(catalog, null);
  let dialog = { ...initialCartDialogState };
  let ready = false;
  let sequence = 0;
  let notice: CartSnapshot["notice"] = null;
  const listeners = new Set<() => void>();
  let snapshot: CartSnapshot = Object.freeze({ quantities: Object.freeze({}), catalog, ready, ...dialog, notice });
  const serverSnapshot = snapshot;

  function publish() {
    const quantities = Object.freeze(store.getCart());
    if (!Object.keys(quantities).length) {
      dialog = cartDialogReducer(dialog, "empty");
    }
    snapshot = Object.freeze({ quantities, catalog, ready, ...dialog, notice });
    for (const listener of listeners) listener();
  }
  function notify(key: MessageKey) { notice = { sequence: ++sequence, key }; }
  return {
    getSnapshot: () => snapshot,
    getQuantities: () => snapshot.quantities,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    restoreStorage(storage?: CartStorage | null) {
      if (ready) return;
      store = createCartStore(catalog, storage);
      ready = true;
      publish();
    },
    registerProducts(products: readonly Product[]) {
      const incoming = new Map(products.map(product => [product.id, product]));
      const next = catalog.map(product => incoming.get(product.id) ?? product);
      if (next.every((product, index) => product === catalog[index])) return;
      catalog = next;
      publish();
    },
    addItem(id: number) {
      if (!ready) return;
      store.addItem(id);
      notify("added");
      publish();
    },
    changeQuantity(id: number, step: number) {
      if (!ready) return;
      store.changeQuantity(id, step);
      publish();
    },
    removeItem(id: number) {
      if (!ready) return;
      store.removeItem(id);
      notify("removed");
      publish();
    },
    open() { dialog = cartDialogReducer(dialog, "open"); publish(); },
    close() { dialog = cartDialogReducer(dialog, "close"); publish(); },
    requestClear() { dialog = cartDialogReducer(dialog, "requestClear"); publish(); },
    cancelClear() { dialog = cartDialogReducer(dialog, "cancelClear"); publish(); },
    confirmClearCart() {
      if (!ready || !dialog.confirmClear) return;
      store.clearCart();
      notify("cleared");
      publish();
    },
    dismissNotice() { notice = null; publish(); },
  };
}
