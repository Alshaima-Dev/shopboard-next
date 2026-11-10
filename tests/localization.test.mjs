import test from "node:test";
import assert from "node:assert/strict";
import { createLanguageStore, createLanguageController } from "../src/features/i18n/language-store.ts";
import { languages, messages, getLanguage, translate, formatPrice, formatNumber, getProductText } from "../src/features/i18n/i18n.ts";
import { routeMessages } from "../src/features/i18n/route-messages.ts";
import { catalogMessages } from "../src/features/i18n/catalog-messages.ts";
import { feedbackMessages } from "../src/features/i18n/feedback-messages.ts";
import { checkoutMessages } from "../src/features/checkout/checkout-messages.ts";
import { products } from "../src/features/products/product-data.ts";
import { applyDocumentLanguage } from "../src/features/i18n/language-document.ts";

test("all original dictionaries retain matching keys in EN, AR, and TR", () => {
  for (const dictionary of [messages, routeMessages, catalogMessages, feedbackMessages, checkoutMessages]) {
    for (const language of ["en","ar","tr"]) {
      assert.deepEqual(Object.keys(dictionary[language]),Object.keys(dictionary.en));
      for (const value of Object.values(dictionary[language])) {
        if (typeof value === "string") assert.ok(value.length);
      }
    }
  }
  assert.equal(getLanguage("constructor"),"en");
  assert.equal(getLanguage("AR"),"en");
  assert.throws(()=>translate("en","constructor"),/Missing translation/);
  assert.throws(()=>translate("en","not-a-key"),/Missing translation/);
});

test("language persistence uses only the original raw-string key and defaults to EN", () => {
  const saved = new Map([["shopboard-language","ar"],["shopboard-catalog-cart-v2",'{"1":2}']]);
  const storage = { getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value) };
  const store = createLanguageStore(storage);
  assert.equal(store.getLanguage(),"ar");
  assert.equal(store.setLanguage("tr"),"tr");
  assert.equal(saved.get("shopboard-language"),"tr");
  assert.equal(saved.get("shopboard-catalog-cart-v2"),'{"1":2}');
  assert.equal(store.setLanguage("unsupported"),"en");
  for (const value of ["", '"ar"', "unsupported", "constructor"]) {
    assert.equal(createLanguageStore({getItem:()=>value,setItem(){}}).getLanguage(),"en");
  }
});

test("blocked storage preserves in-memory switching", () => {
  const store = createLanguageStore({getItem(){throw Error("blocked");},setItem(){throw Error("blocked");}});
  assert.equal(store.getLanguage(),"en");
  assert.equal(store.setLanguage("ar"),"ar");
  assert.equal(store.setLanguage("tr"),"tr");
});

test("provider-local controller hydrates from EN without overwriting saved preference", () => {
  let writes = 0;
  let saved = "ar";
  const controller = createLanguageController();
  const independent = createLanguageController();
  assert.equal(controller.getServerSnapshot(),"en");
  assert.equal(controller.getSnapshot(),"en");
  controller.restore({getItem:()=>saved,setItem:(_,value)=>{writes++;saved=value;}});
  assert.equal(controller.getSnapshot(),"ar");
  assert.equal(controller.getServerSnapshot(),"en");
  assert.equal(writes,0);
  controller.restore(null);
  assert.equal(controller.getSnapshot(),"ar");
  controller.setLanguage("tr");
  assert.equal(saved,"tr");
  assert.equal(independent.getSnapshot(),"en");
});

test("product text, prices, numbers, interpolation and metadata follow source locale rules", () => {
  for (const language of ["en","ar","tr"]) {
    assert.equal(getProductText(products[0],language),products[0].translations[language]);
    assert.equal(formatPrice(89,language),new Intl.NumberFormat(languages[language].locale,{style:"currency",currency:"USD",maximumFractionDigits:0}).format(89));
    assert.equal(formatNumber(2,language),new Intl.NumberFormat(languages[language].locale).format(2));
    assert.ok(translate(language,"openBag",{count:formatNumber(2,language)}).includes(formatNumber(2,language)));
    const attributes = {};
    const target = {documentElement:{},title:"",querySelector:()=>({setAttribute:(key,value)=>{attributes[key]=value;}})};
    applyDocumentLanguage(target,language);
    assert.equal(target.documentElement.lang,language);
    assert.equal(target.documentElement.dir,language==="ar"?"rtl":"ltr");
    assert.equal(target.title,messages[language].title);
    assert.equal(attributes.content,messages[language].meta);
  }
});
