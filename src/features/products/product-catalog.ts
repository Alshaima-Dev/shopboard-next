import { products } from "./product-data.ts";
import { fetchCompleteProducts } from "./products-api.ts";
import type { ProductsApiOptions } from "./products-api.ts";
import type { Product } from "./product-types.ts";

export interface ProductCatalog {
  products: readonly Product[];
  status: "ready" | "error" | "empty";
}

export async function loadProductCatalog(
  options: ProductsApiOptions = {},
): Promise<ProductCatalog> {
  let empty = false;
  const fetcher = options.fetcher ?? globalThis.fetch;
  const result = await fetchCompleteProducts(products, {
    ...options,
    fetcher: async (url, init) => {
      const response = await fetcher(url, init);
      if (response.ok) {
        try {
          const body: unknown = await response.clone().json();
          empty = Array.isArray(body) && body.length === 0;
        } catch {
          // The API adapter classifies JSON and timeout failures.
        }
      }
      return response;
    },
  });
  return {
    products: result.ok ? result.products : products,
    status: result.ok ? "ready" : empty ? "empty" : "error",
  };
}
