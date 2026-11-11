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

## Bug 14

- **What I saw:** Shared content used a 1152px shell with fixed 24px padding instead of the original 1440px container and responsive outer gutters.
- **Type:** logic
- **How I found it:** Compared the shared layout, header, footer, and image sizing with the effective `.wrap` rules in the original `src/styles/storefront.css:63`, `:682`, and `:818`, including the override stylesheet.
- **Cause:** The temporary `max-w-6xl px-6` classes in `src/app/layout.tsx:29`, `src/components/layout/header.tsx:13`, and `src/components/layout/footer.tsx:11` did not use the existing store tokens. `src/features/products/product-grid.tsx:12` still described image sizes for that temporary shell.
- **Fix:** Resolved. Added a single `store-container` utility in `src/app/globals.css:3`, applied it to the three shared wrappers, and updated product image sizes. Chrome measured aligned container widths of 339px, 704px, and 1328px at 375px, 768px, and 1440px, with gutters of 18px, 32px, and 56px. At 1600px the width caps at 1440px. TypeScript, ESLint, 37 unit/API tests, production build, and the full browser regression suite passed.
- **Did I use AI? For what?** Yes. Codex compared the original rules, implemented the shared utility and image sizing, added layout assertions, and verified the result in Chrome.

## Bug 15

- **What I saw:** The new browser geometry assertion initially reported a 269px container at a 320px viewport instead of the expected 284px.
- **Type:** logic
- **How I found it:** The browser assertion reported left gutter 18px and right distance 33px, exposing the additional 15px Windows scrollbar width.
- **Cause:** The geometry checks in `tests/product-cards.browser.mjs:111` compared percentage-based document layout against the full emulated viewport without accounting for a classic scrollbar. The application container correctly used available document width.
- **Fix:** Resolved. Hide scrollbars through Chrome's emulation API for deterministic matched-viewport geometry checks. All container, image, breakpoint, and existing functional browser checks pass. No application scrollbar behavior was changed.
- **Did I use AI? For what?** Yes. Codex diagnosed the test's viewport assumption, adjusted browser emulation, and reran the suite successfully.

## Bug 16

- **What I saw:** The Philosophy header link and footer route links did not expose the current route, unlike the original navigation.
- **Type:** logic
- **How I found it:** Compared the original `NavLink` usage with `src/components/layout/navbar.tsx` and `src/components/layout/footer.tsx` during the shared-layout audit.
- **Cause:** The migrated links lacked pathname-based `aria-current` handling. The header Philosophy link also lacked the original active underline.
- **Fix:** Resolved. Added current-route handling while retaining catalog-mode handling, and restored the header's active underline. Browser checks verify the About header/footer current-page attributes and the 1px header underline after navigation.
- **Did I use AI? For what?** Yes. Codex compared navigation semantics, implemented the correction, and added browser assertions.

## Bug 17

- **What I saw:** The new tablet header assertion rejected a visible bag label because its computed display was `block` rather than `inline`.
- **Type:** logic
- **How I found it:** Chrome's responsive test failed at the bag-label display assertion in `tests/product-cards.browser.mjs`.
- **Cause:** The assertion ignored CSS blockification of flex items. The source-style inline label is correctly displayed as a flex item; its computed display does not remain inline.
- **Fix:** Resolved. Assert that the label is hidden below 701px and visible above it instead of requiring an inline computed display. Application styles were unchanged for this correction.
- **Did I use AI? For what?** Yes. Codex diagnosed the computed-style assumption, corrected the test, and reran the browser checks.

## Bug 18

- **What I saw:** A repeated browser run stopped during cart refresh with a null-element textContent error.
- **Type:** logic
- **How I found it:** Chrome evaluation failed in the post-reload cart-count wait in `tests/product-cards.browser.mjs:307` while the replacement document was still loading.
- **Cause:** The wait dereferenced `#count` before that element existed instead of continuing to poll for restored cart state.
- **Fix:** Resolved. Use an optional element access in that reload wait. The test can now wait through document replacement; application cart behavior was unchanged.
- **Did I use AI? For what?** Yes. Codex traced the test error to document-reload timing and corrected the polling expression.

## Bug 19

- **What I saw:** A temporary home screenshot command stopped with Chrome's `Object reference chain is too long` error.
- **Type:** runtime
- **How I found it:** The Chrome DevTools response failed while the command checked whether home controls were ready.
- **Cause:** The temporary command returned a DOM element from its readiness expression while requesting serialization by value. No application file or line was responsible.
- **Fix:** Resolved. Convert the readiness result to a Boolean and return primitives from screenshot evaluations. Captures at 375px, 768px, and 1440px completed and were inspected. The full application browser suite already passed independently.
- **Did I use AI? For what?** Yes. Codex wrote the screenshot command, diagnosed its serialization error, corrected it, and inspected the rendered captures.

## Bug 20

- **What I saw:** The shared Philosophy CTA depended on the home wrapper for its primary button appearance, preventing standalone reuse on About.
- **Type:** logic
- **How I found it:** Inspected the shared section before reusing it on About and traced `home-primary` to selectors requiring `.home-storefront` in `src/app/home-page.css`.
- **Cause:** `src/features/storefront/philosophy.tsx:13` referenced a home-scoped style rather than a reusable primary action treatment.
- **Fix:** Resolved. Moved the existing action rules into the `storefront-primary` Tailwind utility in `src/app/globals.css:3` and used it in Philosophy and Hero. Direct About loads verify the button colors, radius, display, and minimum height in EN/AR/TR. Home retains identical shared Philosophy markup and button presentation.
- **Did I use AI? For what?** Yes. Codex diagnosed the styling dependency, extracted the utility without duplicating markup or translations, and added browser coverage.

## Bug 21

- **What I saw:** The new home regression assertion briefly measured a transparent CTA background immediately after navigating from About.
- **Type:** logic
- **How I found it:** The browser test failed after the About layout checks; a subsequent DOM inspection showed document readiness complete and the correct burgundy background on both Hero and Philosophy.
- **Cause:** The final home comparison in `tests/product-cards.browser.mjs` waited for streamed content but not completion of stylesheet loading before measuring computed styles.
- **Fix:** Resolved. Wait for document completion and font readiness before comparing the shared markup and button appearance. No application styling change was needed for this timing issue.
- **Did I use AI? For what?** Yes. Codex inspected the loaded styles, identified the premature assertion, and corrected its readiness wait.

## Bug 22

- **What I saw:** The restored Shipping heading used the Latin 1.15 line height in Arabic instead of the original 1.6.
- **Type:** logic
- **How I found it:** The Arabic computed-style assertion in the responsive browser suite failed after all English Shipping checks passed.
- **Cause:** `src/features/shipping/shipping-information.tsx:15` combined `leading-[1.15]` with `rtl:text-heading-arabic`. Tailwind's explicit leading value remained in effect when the Arabic font-size utility changed.
- **Fix:** Resolved. Add `rtl:leading-arabic-heading` explicitly so Arabic uses the existing 1.6 token while English and Turkish retain 1.15. The browser regression check covers the computed line height in every tested language and width.
- **Did I use AI? For what?** Yes. Codex implemented the page, detected the mismatch through Chrome assertions, diagnosed the utility interaction, and applied the explicit RTL line-height correction.

## Bug 23

- **What I saw:** One full browser run failed its final hydration-message guard after all Shipping layout and navigation assertions passed. During Shop review, the captured payload confirmed React text hydration error #418; delayed home loads with a saved Arabic preference reproduced it twice.
- **Type:** runtime
- **How I found it:** The final assertion in `tests/product-cards.browser.mjs` reported that its collected browser errors matched the hydration pattern. The original console payload was not included in that assertion output.
- **Cause:** Confirmed through Chrome's paused hydration frame: a streamed catalog span contained server text `Search products`, while its first client render expected Arabic. `src/features/i18n/language-provider.tsx` had published a restored language through context before the delayed boundary hydrated. Cart consumers in `src/features/cart/cart-context.ts` similarly read restored context state rather than their server snapshot (see Bug 25).
- **Fix:** Resolved for the reproduced streaming sequence. Keep the provider-local language controller in context and let each language consumer use `useSyncExternalStore` with the existing English server snapshot; cart consumers likewise hydrate using their existing server snapshot. Persistence keys, server fetching, and business logic are unchanged. The full production browser suite passed with explicit delayed home/shop cases for saved Arabic and Turkish, enabled late-streamed cart actions, and failure/empty response retries, with no hydration messages. This replaces the earlier unconfirmed diagnosis; it does not claim that every possible future hydration issue is eliminated.
- **Did I use AI? For what?** Yes. Codex improved error capture, reproduced the failure with the existing delayed API scenario, inspected the failing React text node in Chrome, corrected consumer snapshot handling, and verified the production regression cases.

## Bug 24

- **What I saw:** A temporary Chrome debugger command failed with `Object couldn't be returned by value` while inspecting a hydration frame.
- **Type:** runtime
- **How I found it:** The DevTools evaluation rejected the paused-frame inspection result.
- **Cause:** The temporary diagnostic attempted to serialize React fiber values containing objects rather than only plain strings. No application file was responsible.
- **Fix:** Resolved. Return only the node type, text, HTML, and string component names. The corrected command captured the English server span and expected Arabic client text, confirming Bug 23's cause.
- **Did I use AI? For what?** Yes. Codex wrote and corrected the diagnostic serialization, then used the result to diagnose the application issue.

## Bug 25

- **What I saw:** After a delayed home catalog loaded with a saved Arabic preference, its add-to-cart button remained disabled despite the root cart being restored.
- **Type:** state
- **How I found it:** A focused Chrome inspection after document completion returned `addDisabled: true` on the late-streamed home product action.
- **Cause:** `src/features/cart/cart-context.ts` read the restored root context directly in `useCart`. The late consumer's first render therefore differed from its server-rendered disabled state; it did not independently hydrate from the controller's stable server snapshot.
- **Fix:** Resolved. Read the existing controller through `useSyncExternalStore` inside `useCart`, merge that snapshot into the returned context, and derive items/count/total from it. Delayed home and shop checks with saved Arabic and Turkish now explicitly wait for enabled product actions. Existing cart persistence, totals, navigation, dialogs, checkout, and quantity-limit tests also pass.
- **Did I use AI? For what?** Yes. Codex detected the stuck button while investigating streaming hydration, corrected the consumer snapshot handling, and added delayed-action regression coverage.

## Bug 26

- **What I saw:** The new Button prop-type test reported five diagnostics instead of the four intentionally invalid prop values.
- **Type:** logic
- **How I found it:** `node --test tests/button.test.mjs` printed an extra TypeScript incremental-compilation configuration error.
- **Cause:** The virtual compiler fixture in `tests/button.test.mjs` inherited `incremental: true` from the project configuration without supplying a build-info path. This added a configuration diagnostic unrelated to Button props.
- **Fix:** Resolved. Disable incremental compilation only for the in-memory fixture. The application TypeScript configuration remains unchanged, and the test now verifies the four rejected prop values without creating build-info or fixture files.
- **Did I use AI? For what?** Yes. Codex wrote the focused test, diagnosed the extra compiler diagnostic, and corrected its isolated compiler options.

## Bug 27

- **What I saw:** The cart keyboard-trap test failed after the new native-disabled Button check, although dimensions, Space activation, and disabled-click prevention passed.
- **Type:** logic
- **How I found it:** The full browser suite reported focus outside the cart during the following Tab traversal assertion.
- **Cause:** The added check in `tests/product-cards.browser.mjs` temporarily disabled the focused quantity button. Re-enabling it did not establish a reliable starting focus for the next independent keyboard test.
- **Fix:** Resolved. Restore focus explicitly to the cart close button after re-enabling the quantity control. Application focus handling and native disabled semantics are unchanged.
- **Did I use AI? For what?** Yes. Codex added the disabled-control check, identified its effect on the next test, and restored test isolation.

## Bug 28

- **What I saw:** The new Input type-safety test failed even though TypeScript correctly rejected all six invalid prop examples.
- **Type:** logic
- **How I found it:** `node --test tests/input.test.mjs` printed the expected six diagnostics but failed its message-content assertion.
- **Cause:** The test expected rejected boolean/numeric prop values to appear literally in TypeScript's diagnostic text. Those errors instead report the generalized `string` type and its incompatible target type.
- **Fix:** Resolved. Check that each invalid fixture line receives a diagnostic and assert the relevant reported target types instead of requiring literal values. All focused Input tests now pass; application props and compiler settings are unchanged.
- **Did I use AI? For what?** Yes. Codex wrote the fixture, identified the brittle diagnostic assertion, and corrected the test.

## Bug 29

- **What I saw:** The new reverse-Tab browser test failed when focus moved from the first dialog control into browser chrome.
- **Type:** logic
- **How I found it:** `node tests/product-cards.browser.mjs` failed its new focus-containment assertion. A CDP inspection showed `document.hasFocus()` was false while the cart still matched `:modal`.
- **Cause:** `tests/product-cards.browser.mjs` required every Shift+Tab step to leave an element inside the dialog focused. Native dialog traversal permits browser chrome to receive focus; this is expected browser behavior, not an application bug.
- **Fix:** Resolved. Corrected the test to allow browser focus while requiring any focused page element to remain inside the dialog. Added an explicit check that attempting to focus the background cart opener cannot move focus outside the modal. The full production browser suite passed, including reverse Tab, Escape, backdrop dismissal, focus restoration, EN/AR/TR drawer geometry, confirmation focus, and hydration checks.
- **Did I use AI? For what?** Yes. Codex introduced the test assertion, inspected real browser focus through CDP, identified the incorrect assumption, and corrected the test without changing native dialog behavior.

## Bug 30

- **What I saw:** The initial Home CSS migration generated an invalid SVG background-image warning, and its first arbitrary alignment utility did not produce `align-items: end`.
- **Type:** logic
- **How I found it:** The production build reported an invalid URL while optimizing CSS. The matched browser comparison then showed the grid alignment computed as `normal` instead of the baseline's `end`.
- **Cause:** The initial `homeSearchClassName` in `src/features/products/interactive-catalog.tsx:37` escaped quotes inside an arbitrary URL utility; Tailwind scanned those source escapes into invalid CSS. The controls grid also used unsupported `items-[end]` syntax.
- **Fix:** Resolved. Use a quote-free, percent-encoded SVG URL and the supported `[align-items:end]` arbitrary property. The production build has no CSS warning; measured styles and geometry match all 36 EN/AR/TR baseline cases. These were migration errors caught before completion; no original project file was changed.
- **Did I use AI? For what?** Yes. Codex introduced the initial utility classes, diagnosed the compiler warning and computed-style mismatch, corrected both classes, and ran the production and browser checks.

## Bug 31

- **What I saw:** The first dark-mode browser run timed out while trying to move from system mode to dark mode.
- **Type:** logic
- **How I found it:** `node tests/theme.browser.mjs` timed out waiting for `data-theme-preference="dark"` after two scripted clicks.
- **Cause:** `tests/theme.browser.mjs:80` dispatched both clicks synchronously in one evaluation. React batched them against the same rendered system-state handler, so both requested light mode.
- **Fix:** Resolved. Dispatch one click, wait for the light render, then dispatch the second click. The complete theme browser test now verifies all three transitions.
- **Did I use AI? For what?** Yes. Codex wrote the browser scenario, diagnosed its batched-event assumption, and corrected the transition sequencing.

## Bug 32

- **What I saw:** The existing full browser suite stopped during a reload even though the cart count appeared correctly moments later.
- **Type:** logic
- **How I found it:** `node tests/product-cards.browser.mjs` raised a TypeError while polling for the restored count; CDP inspection then showed the expected count of 99.
- **Cause:** `tests/product-cards.browser.mjs:375` read `.textContent` before the streamed header had mounted, so the polling expression threw instead of retrying.
- **Fix:** Resolved. Use optional chaining while polling so the assertion waits through the transient missing element. The full browser suite passes with no hydration errors.
- **Did I use AI? For what?** Yes. Codex ran the suite, inspected the live page through CDP, identified the unsafe transient query, and fixed the polling expression.

## Bug 33

- **What I saw:** A saved dark preference rendered the light background during the first browser animation frame before switching to dark.
- **Type:** runtime
- **How I found it:** The dedicated CDP test installed a pre-document observer and captured the first animation frame during a saved-dark reload. It reported `rgb(248, 241, 231)` before the dark theme attribute appeared.
- **Cause:** `src/app/layout.tsx` used Next.js `Script` with `strategy="beforeInteractive"`. In this rendered document, that script did not apply the theme before the first measured frame.
- **Fix:** Resolved. Render the small static initializer as a parser-executed script in the root `<head>`, before body styles are painted. The first-frame test now requires `data-theme="dark"` and the dark background on the initial frame.
- **Did I use AI? For what?** Yes. Codex designed the first-frame probe, confirmed the flash in Chrome, moved the initializer to the parser-executed head position, and reran hydration and theme validation.

## Bug 34

- **What I saw:** A light-mode assertion received the dark primary color during the final validation run.
- **Type:** state
- **How I found it:** `tests/product-cards.browser.mjs` expected the light burgundy announcement background but received the dark rose value.
- **Cause:** The dark and light browser suites were accidentally started against the same CDP page before the dark suite had exited. Both suites changed the shared document, viewport, storage, and theme state.
- **Fix:** Resolved. Run the browser suites sequentially. Both the dedicated theme suite and complete light storefront suite pass independently on the final production build.
- **Did I use AI? For what?** Yes. Codex identified the shared-browser race from the conflicting computed color and corrected the validation order.

## Bug 35

- **What I saw:** The dark surface test expected the Shop search input itself to have the dark page background, but its computed background was transparent.
- **Type:** logic
- **How I found it:** `node tests/theme.browser.mjs` failed the shared-surface assertion after the browser-suite race was removed.
- **Cause:** `tests/theme.browser.mjs:127` inspected `#product-search`. On the collection page, that input is intentionally transparent inside its styled `label[for="product-search"]` control surface.
- **Fix:** Resolved. Check the owning search-control label's background and continue checking the input text separately. The final theme browser suite passes.
- **Did I use AI? For what?** Yes. Codex traced the computed style to the existing control structure and corrected the test target without changing the component design.
