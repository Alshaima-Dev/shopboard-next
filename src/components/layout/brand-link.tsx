import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function BrandLink({ label, placement }: { label: string; placement: "header" | "footer" }) {
  return (
    <Link href="/" aria-label={label} className={`inline-flex min-w-0 max-w-full flex-col items-center gap-[5px] leading-[1.1] ${placement === "header" ? "[grid-area:brand] justify-self-start text-primary" : "[grid-area:brand] justify-self-center text-primary-foreground tablet:justify-self-start"}`}>
      <BrandMark className="block h-auto w-[42px] tablet:w-[46px]" />
      <span lang="en" dir="ltr" className={`font-brand font-semibold tracking-[0.16em] whitespace-nowrap [unicode-bidi:isolate] ${placement === "header" ? "text-[clamp(18px,5.3vw,26px)] tablet:text-[32px]" : "text-[34px]"}`}>YANINDA</span>
    </Link>
  );
}
