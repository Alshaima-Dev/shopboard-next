"use client";

import { useLocalization } from "./language-provider";

export function LanguagePicker() {
  const { language, setLanguage, t } = useLocalization();
  return (
    <div className="flex items-center">
      <label htmlFor="language" className="sr-only">{t("language")}</label>
      <select id="language" dir="auto" value={language} onChange={(event) => setLanguage(event.currentTarget.value)} className="min-h-touch-target w-[108px] cursor-pointer rounded-control border border-coffee bg-background p-2 text-input">
        <option value="ar" lang="ar" dir="rtl">العربية</option>
        <option value="en" lang="en">English</option>
        <option value="tr" lang="tr">Türkçe</option>
      </select>
    </div>
  );
}
