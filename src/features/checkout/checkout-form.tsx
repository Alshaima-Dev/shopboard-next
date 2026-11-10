"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "../cart/cart-context";
import { checkoutSchema, checkoutDefaults } from "./checkout-schema";
import type { CheckoutValues, CheckoutFieldName } from "./checkout-schema";
import { completeDemoCheckout } from "./checkout-logic";
import type { DemoCheckoutReceipt } from "./checkout-logic";
import { useLocalization } from "../i18n/language-provider";
import { checkoutMessages, checkoutErrorMessage } from "./checkout-messages";

const fields: { name: CheckoutFieldName; type: "text" | "email" | "tel"; autoComplete: string }[] = [
  { name: "fullName", type: "text", autoComplete: "name" },
  { name: "email", type: "email", autoComplete: "email" },
  { name: "phone", type: "tel", autoComplete: "tel" },
  { name: "address", type: "text", autoComplete: "street-address" },
  { name: "city", type: "text", autoComplete: "address-level2" },
  { name: "postalCode", type: "text", autoComplete: "postal-code" },
  { name: "country", type: "text", autoComplete: "country-name" },
];

export function CheckoutForm({ onComplete }: { onComplete: (receipt: DemoCheckoutReceipt) => void }) {
  const cart = useCart();
  const { language } = useLocalization();
  const text = checkoutMessages[language];
  const form = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema), defaultValues: checkoutDefaults });
  const { errors, isSubmitting } = form.formState;
  function submit() {
    if (!completeDemoCheckout(cart.catalog, cart.getQuantities, () => form.reset(), onComplete)) {
      form.setError("root.cart", { type: "cart", message: "empty" });
    }
  }
  const acknowledgementError = checkoutErrorMessage(errors.demoAcknowledged?.message, language);

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} aria-labelledby="checkout-form-title" aria-describedby="checkout-demo-note checkout-form-note" aria-busy={isSubmitting} className="min-w-0 space-y-6">
      <h2 id="checkout-form-title" className="font-heading text-2xl text-primary">{text.formTitle}</h2>
      <p id="checkout-form-note">{text.requiredNote}</p>
      <fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0">
        <legend className="sr-only">{text.formTitle}</legend>
        <div className="grid gap-6 tablet:grid-cols-2">
          {fields.map(field => {
            const id = `checkout-${field.name}`;
            const error = checkoutErrorMessage(errors[field.name]?.message, language);
            return (
              <div key={field.name} className="grid min-w-0 content-start gap-2">
                <label htmlFor={id} className="text-start text-[13px] leading-[1.6] font-medium">{text.fields[field.name]}</label>
                <input
                  {...form.register(field.name)}
                  id={id} type={field.type} autoComplete={field.autoComplete}
                  dir={field.type === "email" || field.type === "tel" ? "ltr" : undefined}
                  aria-required={field.name !== "phone"}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className="min-h-[46px] w-full min-w-0 rounded-md border border-coffee bg-transparent px-3 py-[10px] text-input shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-primary aria-invalid:ring-primary/20 disabled:opacity-50"
                />
                {error && <p id={`${id}-error`} role="alert" className="font-semibold text-primary">{error}</p>}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-start gap-3 leading-[1.8]">
          <input id="checkout-demo" type="checkbox" {...form.register("demoAcknowledged")} aria-invalid={Boolean(acknowledgementError)} aria-describedby={acknowledgementError ? "checkout-demo-note checkout-demo-error" : "checkout-demo-note"} className="mt-[6px] shrink-0 accent-primary" />
          <label htmlFor="checkout-demo" className="min-h-touch-target">{text.acknowledge}</label>
        </div>
        {acknowledgementError && <p id="checkout-demo-error" role="alert" className="font-semibold text-primary">{acknowledgementError}</p>}
        {errors.root?.cart && <p role="alert" className="font-semibold text-primary">{text.empty}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-5 min-h-touch-target w-full rounded-control bg-primary px-5 py-[10px] font-medium text-primary-foreground disabled:opacity-50">
          {isSubmitting ? text.submitting : text.submit}
        </button>
      </fieldset>
      <p role="status" aria-live="polite">{isSubmitting ? text.submitting : ""}</p>
    </form>
  );
}
