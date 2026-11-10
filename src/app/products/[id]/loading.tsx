import { RouteText } from "@/features/i18n/language-provider";

export default function Loading() {
  return <p role="status" aria-live="polite"><RouteText name="loading" /></p>;
}
