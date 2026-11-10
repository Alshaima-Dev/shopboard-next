"use client";

import { useLocalization } from "../i18n/language-provider";

export function ProductError({ retry }: { retry: () => void }) {
  const { route } = useLocalization();
  return (
    <section aria-labelledby="product-error-title" className="space-y-4">
      <h1 id="product-error-title" className="text-3xl font-semibold">{route.detailsTitle}</h1>
      <p role="alert">{route.error}</p>
      <button type="button" onClick={() => retry()} className="rounded border px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-4">
        {route.retry}
      </button>
    </section>
  );
}
