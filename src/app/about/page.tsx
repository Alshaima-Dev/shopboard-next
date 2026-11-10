import { RouteText } from "@/features/i18n/language-provider";
import { Philosophy } from "@/features/storefront/philosophy";

export default function AboutPage() {
  return (
    <div className="-my-12" data-about-page>
      <h1 className="mt-[22px] mb-[17px] font-heading text-[57px] leading-[1.12] font-medium tracking-[-3px] text-primary tablet:mt-[30px] tablet:mb-[23px] tablet:text-[clamp(48px,5.2vw,78px)] wide:tracking-[-4px] rtl:tracking-normal">
        <RouteText name="about" />
      </h1>
      <Philosophy />
    </div>
  );
}
