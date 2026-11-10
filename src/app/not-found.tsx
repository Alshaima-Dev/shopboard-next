import { RouteText } from "@/features/i18n/language-provider";
import Link from "next/link";

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="space-y-6">
      <h1 id="not-found-title" className="text-3xl font-semibold"><RouteText name="notFound" /></h1>
      <p><RouteText name="notFoundDescription" /></p>
      <Link href="/shop" className="inline-block underline underline-offset-4"><RouteText name="shop" /></Link>
    </section>
  );
}
