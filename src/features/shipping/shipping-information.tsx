import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RouteText } from "@/features/i18n/language-provider";

const headingClassName = "font-heading text-[clamp(20px,2.5vw,26px)] leading-[1.4] font-medium tracking-[-1.2px] text-balance text-primary rtl:leading-arabic-heading rtl:tracking-normal";
const paragraphClassName = "max-w-[70ch] text-[15px] leading-[1.85] [overflow-wrap:break-word] rtl:leading-arabic-body";

export function ShippingInformation() {
  return (
    <div className="-my-12">
      <section aria-labelledby="shipping-title" className="my-[clamp(32px,6vw,72px)] text-start [line-height:normal]" data-shipping-page>
        <div className="mb-8 max-w-[760px]">
          <span className="text-[10px] font-medium tracking-[1.6px] text-primary rtl:leading-[1.9] rtl:tracking-normal"><RouteText name="shippingEyebrow" /></span>
          <h1 id="shipping-title" className="mt-3 mb-6 font-display text-[clamp(36px,5vw,58px)] leading-[1.15] font-medium tracking-[-3px] text-balance text-primary wide:tracking-[-4px] rtl:text-heading-arabic rtl:leading-arabic-heading rtl:tracking-normal">
            <RouteText name="shipping" />
          </h1>
        </div>
        <div className="grid gap-5 tablet:grid-cols-2" data-shipping-cards>
          <Card as="section" variant="soft" padding="responsive">
            <span aria-hidden="true" className="text-[13px] text-muted-foreground tabular-nums">01</span>
            <h2 className={`mt-5 mb-3 ${headingClassName}`}><RouteText name="shippingThreshold" /></h2>
            <p className={paragraphClassName}><RouteText name="shippingDescription" /></p>
          </Card>
          <Card as="section" variant="soft" padding="responsive">
            <span aria-hidden="true" className="text-[13px] text-muted-foreground tabular-nums">02</span>
            <h2 className={`mt-5 mb-3 ${headingClassName}`}><RouteText name="shippingCurrency" /></h2>
            <p className={paragraphClassName}><RouteText name="shippingCurrencyDescription" /></p>
          </Card>
        </div>
        <Card as="aside" variant="outline" padding="responsive" aria-labelledby="shipping-availability" className="mt-6">
          <h2 id="shipping-availability" className={`mb-3 ${headingClassName}`}><RouteText name="shippingAvailability" /></h2>
          <p className={paragraphClassName}><RouteText name="shippingDemo" /></p>
          <Link href="/shop" className="mt-3 inline-block py-2 text-primary underline underline-offset-4 [touch-action:manipulation]">
            <RouteText name="shop" />
          </Link>
        </Card>
      </section>
    </div>
  );
}
