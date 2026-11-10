"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocalization } from "../i18n/language-provider";

export function CampaignImage() {
  const { t } = useLocalization();
  const [failures, setFailures] = useState(0);
  const unavailable = t("imageUnavailable", { name: "YANINDA" });
  return failures < 2 ? (
    <Image src={failures ? "/images/products/fallback.svg" : "/images/brand/yaninda-campaign.jpg"}
      width={1200} height={1200} alt={failures ? unavailable : t("heroAlt")}
      sizes="(min-width: 1552px) 756px, (min-width: 1101px) calc((100vw - 112px) * 0.525), (min-width: 701px) calc((100vw - 64px) * 0.525), calc(100vw - 36px)"
      fetchPriority="high" loading="eager" unoptimized={failures > 0}
      onError={() => setFailures(count => count + 1)} className="block aspect-square h-auto w-full object-contain object-center" />
  ) : <p role="status" className="m-5 p-6 text-center text-caption">{unavailable}</p>;
}
