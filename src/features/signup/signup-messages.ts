import type { Language } from "../products/product-types";
import { translate } from "../i18n/i18n";

function copy(language: Language) {
  return {
    title: translate(language, "signupTitle"),
    note: translate(language, "signupNote"),
    email: translate(language, "signupEmail"),
    password: translate(language, "signupPassword"),
    passwordHint: translate(language, "signupPasswordHint"),
    submit: translate(language, "signupSubmit"),
    success: translate(language, "signupSuccess"),
  };
}

export const signupMessages = { en: copy("en"), ar: copy("ar"), tr: copy("tr") };