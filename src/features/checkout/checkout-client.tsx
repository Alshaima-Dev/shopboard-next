"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../cart/cart-context";
import type { DemoCheckoutReceipt } from "./checkout-logic";
import { useLocalization } from "../i18n/language-provider";
import { checkoutMessages } from "./checkout-messages";
import { CheckoutForm } from "./checkout-form";
import { CheckoutSummary } from "./checkout-summary";
import { CheckoutSuccess } from "./checkout-success";

export function CheckoutClient() {
  const cart = useCart();
  const [receipt, setReceipt] = useState<DemoCheckoutReceipt | null>(null);
  const { language, route } = useLocalization();
  const text = checkoutMessages[language];
  if (receipt) return <CheckoutSuccess receipt={receipt} onRestart={() => setReceipt(null)} />;
  if (!cart.ready) return <p role="status">{route.loading}</p>;
  if (!cart.items.length) {
    return (
      <section className="space-y-6">
        <h1 className="font-heading text-3xl text-primary">{text.title}</h1>
        <p role="status">{text.empty}</p>
        <Link href="/" className="inline-flex min-h-touch-target items-center rounded-control bg-primary px-5 py-[10px] text-primary-foreground">{route.back}</Link>
      </section>
    );
  }
  return (
    <section className="space-y-6">
      <h1 className="font-heading text-3xl text-primary">{text.title}</h1>
      <p id="checkout-demo-note" className="border-s-2 border-accent ps-4">{text.demo}</p>
      <div className="grid gap-6 desktop:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] desktop:items-start desktop:gap-8">
        <CheckoutForm onComplete={setReceipt} />
        <CheckoutSummary />
      </div>
    </section>
  );
}
