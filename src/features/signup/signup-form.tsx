"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLanguage } from "../i18n/language-provider";
import { signupMessages } from "./signup-messages";
import { signupValidation, submitSignupDemo } from "./signup-submit";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const inputClassName = "min-w-0 w-full rounded-control border border-coffee bg-background px-[14px] py-3 text-input leading-[1.5] text-foreground";

export function SignupForm() {
  const { language } = useLanguage();
  const text = signupMessages[language];
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [notice, setNotice] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function notifySuccess() {
    clearTimeout(timer.current);
    setNotice((sequence) => sequence + 1);
    timer.current = setTimeout(() => setNotice(0), 2600);
  }

  return (
    <section id="signup" aria-labelledby="signup-title" lang={language} dir={language === "ar" ? "rtl" : "ltr"} className="my-12 rounded-[16px] border border-border bg-soft px-6 py-7">
      <h2 id="signup-title" className="mb-3 text-center font-display text-[32px] font-medium text-primary rtl:text-[26px]">{text.title}</h2>
      <p id="signup-note" className="mx-auto mb-6 max-w-[60ch] text-center text-[13px] leading-[1.8]">{text.note}</p>
      <form id="signup-form" method="post" onSubmit={(event) => submitSignupDemo(event, notifySuccess)} aria-labelledby="signup-title" aria-describedby="signup-note" className="mx-auto max-w-[480px]">
        {/* The SPA source renders no form without JS. Keep SSR controls inert
            until the native-validation handler is hydrated, preventing a POST. */}
        <fieldset disabled={!hydrated} aria-labelledby="signup-title" className="grid min-w-0 gap-[18px] border-0 p-0">
          <div className="grid min-w-0 gap-2">
            <label htmlFor="signup-email" className="text-start text-[13px] leading-[1.6]">{text.email}</label>
            <input id="signup-email" name="email" type="email" autoComplete="email" dir="ltr" {...signupValidation.email} className={inputClassName} />
          </div>
          <div className="grid min-w-0 gap-2">
            <label htmlFor="signup-password" className="text-start text-[13px] leading-[1.6]">{text.password}</label>
            <input id="signup-password" name="password" type="password" autoComplete="new-password" aria-describedby="signup-password-hint" {...signupValidation.password} className={inputClassName} />
            <small id="signup-password-hint" className="text-[13px] leading-[1.7]">{text.passwordHint}</small>
          </div>
          <button type="submit" className="min-h-touch-target rounded-control bg-primary px-5 py-3 font-medium text-primary-foreground">{text.submit}</button>
        </fieldset>
      </form>
      <div role="status" aria-live="polite" aria-atomic="true" className={notice ? "fixed bottom-6 left-1/2 z-50 max-w-[calc(100%_-_32px)] -translate-x-1/2 rounded-control bg-primary px-5 py-3 text-primary-foreground shadow-card" : "sr-only"}>
        {notice > 0 && <span key={notice}>{text.success}</span>}
      </div>
    </section>
  );
}
