# Bug Log

Record confirmed bugs and errors here using the structure required by AGENTS.md. No confirmed application bugs have been recorded yet.

## Bug 1

- **What I saw:** The new default font-family variables took precedence over the Arabic variables on `<html lang="ar">`.
- **Type:** logic
- **How I found it:** CSS cascade review after implementing the tokens: `:root` has specificity 0-1-0, while `:where([lang="ar"])` has specificity 0-0-0.
- **Cause:** `src/app/globals.css:74` originally used a standalone `:root` selector for the Latin defaults. Its higher specificity prevented the later Arabic rule from overriding those variables on the same root element.
- **Fix:** Changed the defaults to `:where(:root, [lang="en"], [lang="tr"])` at line 74. Both language rules now have zero specificity, so the later Arabic rule wins. Scoped Arabic heading/paragraph line heights to each element's own language to keep nested English/Turkish text independent.
- **Did I use AI? For what?** Yes. Codex identified the specificity conflict, implemented the correction, and validated the updated configuration with TypeScript, ESLint, and the production build.
## Bug 2

- **What I saw:** The new browser test reported three columns at 320px and no keyboard outline, even though the viewport and focus checks later passed.
- **Type:** logic
- **How I found it:** Browser-test assertion failures, followed by inspecting the emulated viewport and repeating the check with real keyboard input.
- **Cause:** `tests/product-cards.browser.mjs:48` originally sampled layout immediately after changing device metrics. Its focus check also assumed programmatic focus established keyboard modality.
- **Fix:** Wait for the requested innerWidth and two animation frames before reading layout. Enable focus emulation and send a Tab key event before checking focus-visible. All ten viewport checks and keyboard focus now pass.
- **Did I use AI? For what?** Yes. Codex wrote the browser test, diagnosed its setup errors, corrected them, and reran it in Chrome.

## Bug 3

- **What I saw:** The browser test stopped with `Object reference chain is too long` while waiting for an image-failure status.
- **Type:** runtime
- **How I found it:** Chrome DevTools Protocol returned a serialization error during the test.
- **Cause:** `tests/product-cards.browser.mjs:34` originally returned a DOM element from a polling expression with returnByValue enabled, attempting to serialize its React/DOM references.
- **Fix:** Convert polling expressions to Boolean inside the browser before returning their result. The fallback checks now complete.
- **Did I use AI? For what?** Yes. Codex identified the serialization cause, implemented the Boolean conversion, and verified the result in Chrome.

## Bug 4

- **What I saw:** The double-image-failure test timed out although the first card correctly removed its broken image and showed its status message.
- **Type:** logic
- **How I found it:** The test timed out; inspecting the first card's rendered HTML confirmed that no image remained there.
- **Cause:** `tests/product-cards.browser.mjs:150` originally used a document-wide `article img` query. Once the first card removed its image, that query found the second card's healthy image instead.
- **Fix:** Scope the image and status queries to the first article. The double-failure check now passes without changing application behavior.
- **Did I use AI? For what?** Yes. Codex inspected the DOM, corrected the test selector, and reran the browser checks successfully.
## Bug 5

- **What I saw:** Product titles are dark chocolate in the Next.js cards instead of the original burgundy at 375px, 768px, and 1440px, including RTL styling.
- **Type:** logic
- **How I found it:** Matched-viewport Chrome screenshots and computed-style comparisons: original rgb(107, 44, 44), new rgb(62, 39, 35).
- **Cause:** `src/features/products/product-card.tsx:46` does not apply the primary color to the heading, so it inherits the article's foreground color. The original `src/styles/storefront.css:1632` includes h3 in the burgundy heading rule.
- **Fix:** Resolved. Added the existing `text-primary` token to the heading in `src/features/products/product-card.tsx:46`. Chrome computed styles confirm rgb(107, 44, 44) at 375px, 768px, and 1440px and in Arabic/RTL emulation. The browser regression test now asserts the title color. TypeScript, ESLint, API tests, and the production build passed.
- **Did I use AI? For what?** Yes. Codex identified the missing color during the audit, applied the token, added regression coverage, and verified the correction in Chrome.

## Bug 6

- **What I saw:** When a product image fails, the new status caption sits over the center of the fallback icon instead of across the bottom of the image.
- **Type:** logic
- **How I found it:** Blocked the same product image in both local projects and captured fallback screenshots at 768px in English. Both recovered to the original SVG, but the caption placement differed.
- **Cause:** `src/features/products/product-photo.tsx:34` uses a relative grid item with 95% background opacity. The original `src/styles/storefront.css:1522` absolutely positions the caption at the bottom across the image with 94% background opacity.
- **Fix:** Resolved. Changed `src/features/products/product-photo.tsx:34` to absolute positioning with logical start/end insets, bottom zero, and `bg-background/94`. The accessible status role remains intact. Browser checks confirm zero bottom gap, full image-region width, and 94% background opacity in LTR and Arabic/RTL emulation. Both image-failure paths still pass. TypeScript, ESLint, API tests, and the production build passed.
- **Did I use AI? For what?** Yes. Codex diagnosed the placement difference, applied the scoped utility changes, added geometry/opacity regression assertions, and verified fallback behavior in Chrome.

## Bug 7

- **What I saw:** The new price line box is 21px high rather than the original 18px, slightly increasing the title/price row height and shifting the following copy.
- **Type:** logic
- **How I found it:** Chrome computed-style and element-bound measurements at all three audit widths. Title line height matched at 20.3px, but the new price's inherited 21px line height made that row taller.
- **Cause:** `src/features/products/product-card.tsx:55` does not specify line height, so it inherits the Next.js body's Tailwind 1.5 line height. The original price inherits normal line height. Original and new fonts, price size, weight, and currency text matched.
- **Fix:** Resolved. Added `[line-height:normal]` directly to the price in `src/features/products/product-card.tsx:55`, without changing global typography. Chrome confirms normal line height and an 18px English price line box at 375px, 768px, and 1440px; normal line height is also retained in Arabic/RTL emulation. The browser test now asserts these properties. TypeScript, ESLint, API tests, and the production build passed.
- **Did I use AI? For what?** Yes. Codex traced the inherited line height, applied the price-only fix, added regression coverage, and measured the corrected line boxes in Chrome.

## Bug 8

- **What I saw:** The production build stopped with EBUSY while unlinking a temporary Chrome metrics file.
- **Type:** runtime
- **How I found it:** Production-build output reported the locked file. A process inspection restricted to this project's test-profile path found the old headless Chrome processes still running.
- **Cause:** The earlier browser test profile was located at `.next/card-browser-profile`. Its open `CrashpadMetrics-active.pma` file conflicted with Next.js cleanup of generated build output.
- **Fix:** Resolved for validation. Stopped only the Chrome processes belonging to that exact project test profile and reran the production build successfully. The current verification browser uses a dedicated profile under `node_modules/.cache/shopboard-card-browser-profile`, outside the build output. No application configuration, shared layout, or source-project files changed.
- **Did I use AI? For what?** Yes. Codex diagnosed the build lock, identified the project-specific processes, released the lock, chose an isolated verification profile, and reran the build and browser checks.

## Bug 9

- **What I saw:** The new catalog browser test timed out after changing the search field: the input showed the query, but all twelve cards remained.
- **Type:** logic
- **How I found it:** The browser assertion timed out. DOM inspection showed the query value and unchanged result count; repeating the interaction with browser keyboard input succeeded.
- **Cause:** The initial test setup at `tests/product-cards.browser.mjs:181` treated server-rendered cards as proof that the interactive document was ready, then its search helper dispatched synthetic input immediately after reload. That did not reliably exercise React's hydrated input handling.
- **Fix:** Wait for document readiness and use Chrome keyboard/input commands in `setSearch` at line 182 instead of assigning the value and dispatching a synthetic event. Combined filters, mode resets, navigation/back persistence, and empty-result recovery now pass in the browser. No application fetching or filter logic needed a correction.
- **Did I use AI? For what?** Yes. Codex wrote the test, diagnosed the interaction setup, corrected it to use browser input, and reran the full browser suite successfully.
## Bug 10

- **What I saw:** The checkout browser test kept the invalid phone value and timed out expecting focus on the required demo acknowledgement.
- **Type:** logic
- **How I found it:** The browser test timed out. DOM inspection showed that the phone still contained `letters`, with the expected phone and acknowledgement errors; no application schema change was needed.
- **Cause:** The test's `fillCheckout` helper in `tests/product-cards.browser.mjs:392` attempted to edit immediately after an asynchronous RHF validation submission. It did not wait for the disabled fieldset and busy form to become interactive again.
- **Fix:** Wait for the fieldset to be enabled and aria-busy to be false before browser keyboard input. The phone can then be cleared, acknowledgement validation receives focus, and valid/invalid submission checks pass. TypeScript, ESLint, all 29 unit/API tests, and the production build passed.
- **Did I use AI? For what?** Yes. Codex inspected the failing test and DOM state, corrected the test's interaction timing, and reran the checkout browser checks. Application validation behavior was unchanged.

## Bug 11

- **What I saw:** Repeating the browser suite with a saved cart caused catalog-count and fallback-caption assertions to fail even though the catalog was correct.
- **Type:** logic
- **How I found it:** A twelve-card assertion timed out; a later fallback-position assertion inspected a zero-sized status caption. DOM inspection showed that the matched caption belonged to an item in the closed cart dialog.
- **Cause:** Catalog checks beginning at `tests/product-cards.browser.mjs:50` queried all document articles and fallback statuses. After restoring a saved cart, its hidden item articles and image statuses also matched those selectors.
- **Fix:** Scope catalog card counts, image checks, and fallback queries to `main article`, retaining explicit cart selectors for cart tests. The suite now passes with persisted cart state, including the correct catalog fallback geometry. No application code changed for this correction.
- **Did I use AI? For what?** Yes. Codex identified the hidden-dialog selector collision, scoped the browser assertions, and reran the complete catalog/cart/checkout suite successfully.

## Bug 12

- **What I saw:** The not-found page description remained English after switching languages, while its heading and navigation were translated.
- **Type:** logic
- **How I found it:** A source-text audit during localization found the remaining English literal in the not-found page.
- **Cause:** `src/app/not-found.tsx:8` rendered a hardcoded description instead of the existing translated `notFoundDescription` entry.
- **Fix:** Resolved. Render the description through `RouteText`. Chrome verification confirms that an unknown route displays the original Turkish description after restoring the saved language. Existing streaming HTTP-status behavior is unchanged.
- **Did I use AI? For what?** Yes. Codex found the untranslated literal, connected the shared translation entry, and added browser verification.

## Bug 13

- **What I saw:** A verification command could not run npm because PowerShell blocked `npm.ps1` under its execution policy.
- **Type:** runtime
- **How I found it:** The verification command printed `PSSecurityException` before TypeScript and lint could start.
- **Cause:** The shell resolved `npm` to the installed PowerShell script. This is a command invocation issue, with no application file or line responsible.
- **Fix:** Resolved by invoking `npm.cmd` explicitly. TypeScript and ESLint completed successfully without changing execution policy or application configuration.
- **Did I use AI? For what?** Yes. Codex identified the shell resolution error, corrected the command, and reran validation.
