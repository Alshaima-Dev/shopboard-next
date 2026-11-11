# ShopBoard Next.js

Minimal Next.js App Router foundation. The original React project is read-only; feature and design migration are outside this initialization task.

## Development

Use Node.js 20.9 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Validation

```sh
npm run typecheck
npm run lint
npm run build
npm start
```

Tailwind CSS v4 uses `@tailwindcss/postcss` in `postcss.config.mjs` and CSS-first tokens in `src/app/globals.css`. Components are Server Components by default. The `@/*` alias resolves to `src/*`.
## Product API

Server-rendered `/shop` and `/products/[id]` use the original API at `https://shopboard-api-nu.vercel.app`. The transport has a five-second timeout, uncached requests, and runtime validation. Collection responses must contain every original product ID exactly once before replacing the local catalog. Invalid, empty, partial, and failed responses retain the complete local catalog; product details distinguish a genuine 404 from an operational error.

The original product types, category definitions, EN/AR/TR product translations, and image paths are retained. Product JPEGs are served from `public/images/products/`. The current UI displays English only; language switching and final styling remain deferred.

For manual scenario checks, set `SHOPBOARD_API_SCENARIO` in the server environment to `normal`, `delay`, `fail`, or `empty`, then restart the server. These preserve the original `/delay/3000`, `/fail/500`, and `/empty` API prefixes. Do not use a `NEXT_PUBLIC_` variable. The delay remains inside the five-second timeout.

Route loading boundaries stream accessible status messages. Unexpected failures reach Client Component error boundaries using the installed Next.js `retry()` API, which re-fetches the segment. Expected catalog failures instead retain usable local products.

Next.js streaming limitation: once `loading.tsx` has started the response, a later `notFound()` renders the not-found page with `noindex` while retaining HTTP 200. The upstream product endpoint returns HTTP 404 for unknown IDs. A strict document HTTP 404 would require checking existence before streaming; this implementation preserves route loading and avoids duplicate API requests.

## Product validation tests

Run `node --test tests/products-api.test.mjs` using a Node.js version with native TypeScript support (verified on Node.js 26). Tests cover runtime validation, stable complete IDs, fallback retention, timeout/body aborts, detail errors, scenario prefixes, request counts, and the retry callback. The normal application commands continue to use Next.js compilation.
## Foundational design tokens

`src/app/globals.css` defines CSS-first Tailwind v4 tokens measured from the original styling, without importing its component CSS.

- Palette: burgundy `#6b2c2c`, cream `#f8f1e7`, beige `#d8c3a5`, coffee `#8b6b4a`, and chocolate `#3e2723`. Semantic primary/background/foreground/accent/ring aliases reference these colors. Soft surfaces and borders use the original 16% and 65% beige-to-cream `color-mix()` formulas.
- Typography: `font-sans` uses DM Sans, `font-heading` uses Manrope, `font-display` uses Cormorant Garamond, and `font-arabic` uses Noto Sans Arabic. Language-scoped variables switch body/heading/display families for explicit Arabic language scopes. `font-brand` deliberately keeps the original Latin serif wordmark family. Nested EN/TR scopes restore the Latin families. Arabic has upright text, natural tracking, 1.6 heading line height, and 2 paragraph line height.
- Fonts: `src/app/fonts.ts` uses `next/font/google`, with the source weights (400–700 body/Arabic, 400–800 Manrope, 500/600 Cormorant, including italic). Latin-ext covers Turkish. Arabic glyphs are included. `display: swap` and fallback families are configured. Only the body font is preloaded; the remaining families load when used. Google is contacted at build time; browsers receive self-hosted font assets.
- Spacing: source gutters are 18/32/56px per side; the container maximum is 1440px; grid gaps are 16px inline and 24px block; section spacing is 48px; touch targets and primary controls are 44/48px. These are named measurements, not an invented uniform scale. Existing Tailwind spacing remains unchanged.
- Responsive variants: `catalog:` = 400px, `tablet:` = 701px, `desktop:` = 901px, and `wide:` = 1101px (expressed in rem using the browser's initial 16px size). Existing `sm:`/`md:`/`lg:` variants remain unchanged. Future component migration can adopt the original thresholds explicitly.
- Source shape/motion values: control/image/card radii 8/12/21px, original two-layer card shadow, and `cubic-bezier(0.23, 1, 0.32, 1)` easing.
- Body text is 14px, matching the source. The document root rem size remains unchanged to avoid resizing the existing temporary utility layouts. Fluid hero/Arabic heading sizes are available as tokens but are not applied to components yet.
- RTL: continue to use `dir="rtl"` for Arabic containers/documents, logical spacing/alignment (`ps`, `pe`, `ms`, `me`, `start`, `end`), and Tailwind `rtl:` variants when directional components are migrated. Language typography does not introduce a language switch or change document direction. Preserve the wordmark's explicit `lang="en" dir="ltr"`. Arrow mirroring and header action placement remain component migration work.

Full storefront, hero, product card, final component typography, responsive container adoption, and visual/device RTL verification remain deferred.
## Product cards and grid

The `/shop` Server Component now renders reusable `ProductGrid` and `ProductCard` Server Components. Product fetching, validation, fallback selection, data, and route URLs are unchanged. The small `ProductPhoto` Client Component handles only image failure state; it receives image text/paths rather than API configuration.

Cards use the original cream surface, 21px outer radius, 12px image radius, 8px inset, subtle two-layer shadow, square contain-fit photos, 14px medium titles, 14px semibold isolated prices, 11px categories, and 12px descriptions. Pointer hover uses the original elevated shadow and title underline under hover/fine-pointer media guards. Keyboard focus retains a burgundy outline and card elevation. No animation was added.

The grid is one column below 400px, two from 400px, and three from 901px. Gaps are 24px vertically / 16px horizontally below 701px and 28px / 24px from 701px. Logical copy spacing, start alignment, bidirectional price isolation, and optional EN/AR/TR presentation props prepare the components for later localization; no language switch was added.

JPEGs use Next.js optimization with lazy loading, responsive sizes matched to the current shared shell, and uncropped square presentation. On error, the original `public/images/products/fallback.svg` is displayed with translated accessible status text; if that also fails, the image is removed while its square region and message remain. SVG fallback is served unoptimized. The detail-page presentation remains unchanged.

Browser regression checks: start the production server at `http://127.0.0.1:3107`, launch a dedicated headless Chrome profile with remote debugging on `127.0.0.1:9224`, and run `node tests/product-cards.browser.mjs` with Node.js 26. Set `SHOPBOARD_TEST_ORIGIN` to use another server address. The test uses built-in WebSocket/CDP support, adds no dependencies, and writes desktop/mobile screenshots under `.next/`. It verifies ten viewport widths, exact column transitions/gaps, no horizontal overflow, image fitting and optimization, keyboard/hover states, reduced motion, Arabic/RTL styling via DOM emulation, and both image-failure paths.

Remaining differences: the add-to-cart control is intentionally absent while cart work is deferred. The existing temporary shared shell retains its 1152px maximum width and 24px gutters; original 1440px container/gutter adoption, collection heading/controls, full storefront, hero, language switching, pixel-parity comparison against the source, and real-device verification remain separate work.
## Interactive catalog

`/shop` still fetches and validates the collection in its Server Component. API transport and complete-catalog fallback are unchanged. `ProductGrid` and `ProductCard` remain Server Components: they pass rendered card slots plus serializable product data into `InteractiveCatalog`. The client filters/reorders those slots; it does not import the server card renderer or API layer. The existing image-only Client Component is unchanged.

The root `CatalogProvider` holds only in-memory control state, shared with the header navbar and catalog controls. Selecting either header mode navigates to the same `/shop` URL, resets search/category/sort, and selects either all products or strictly-under-$50 products. No query parameters or storage keys were added. State survives ordinary client navigation and browser Back, as in the original shared storefront layout; a full reload starts with default controls. Mode selection uses Next.js `onNavigate` for ordinary client navigation; modified/new-tab links retain native navigation behavior.

`product-logic.ts` retains the original pure search/category/sort/price-selection algorithms, including normalized, case-insensitive localized-name search, Arabic diacritic handling, stable default order, copied-array price sorting, and strict `< 50` comparison. Only its original localization imports were replaced by small pure language lookups, without implementing a language switch. Source/migrated parity was verified against 360 combinations. The UI currently uses the original English labels.

Search, category, and sorting compose with the selected catalog mode. Live result counts, properly associated native controls, the original empty-result message, Back to Home, and Clear filters are restored. Clear filters uses the original all-products mode reset. Card styling, image sizing/optimization, URLs, and shared-shell geometry are unchanged. The unresolved shared-container/gutter differences remain deferred.

Validation: `node --test tests/products-api.test.mjs tests/catalog-controls.test.mjs` checks API/fallback behavior plus pure controls and selection. The existing `tests/product-cards.browser.mjs` now also checks combined controls, mode reset from the same/another route, navigation and browser Back, product detail links, empty recovery, live counts, and absence of URL parameters. Native browser keyboard input is used for search. API fetching is never moved into a client effect.

Cart, checkout, signup, language switching, hero migration, and final shared layout remain outside this step.
## Shopping cart

The cart uses the original `shopboard-catalog-cart-v2` storage key and ID-to-number quantity map. `cart-store.ts`, `cart-types.ts`, `cart-logic.ts`, and `cart-dialog-state.ts` retain the original validation, limits, arithmetic, and dialog transitions. Quantities are positive integers capped at 99; decrementing to zero removes a line. Unknown saved IDs and invalid quantities are ignored. Corrupt, blocked, or quota-exhausted storage does not prevent in-memory shopping.

Each root `CartProvider` creates its own controller. `useSyncExternalStore` uses a stable empty server snapshot and the same initial hydration snapshot. Storage is restored once after hydration, without writing an empty initial cart over existing saved data. Add controls remain disabled until restoration finishes. Subsequent user actions persist through the original store. No global mutable server cart or browser API fetches are introduced.

The root receives the original local product catalog as server props. `CartCatalogRegistration` synchronizes validated collection/detail props from existing Server Components into the browser cart, so product names/prices and totals can update without resetting quantities or fetching in an effect. Product cards and grid remain server-rendered; the add button and image failure handling are small client leaves. The catalog's independent control state is unchanged.

The header bag shows the total item count. Cards and product detail pages can add items. A native modal dialog restores item removal, quantity controls, subtotal, the $100 shipping-threshold message, empty recovery, clear confirmation/cancellation, Escape/backdrop closure, native focus containment, and deliberate focus recovery after removal or confirmation. Add/remove/clear feedback uses the original English messages and 2600ms notification duration; modal feedback is also available inside the dialog's active accessibility tree. Logical positioning supports RTL; the drawer is full width on small screens and capped at 480px on larger screens. Its scrolling is contained and background scrolling is locked while open.

The original Review your bag action only links to the already existing `/checkout` placeholder and closes the cart. No checkout, order, payment, signup, language switching, or hero functionality was implemented. Shared container/gutter and final visual differences remain deferred. Cross-tab cart synchronization was not added because the original cart does not implement it.

Validation: `node --test tests/*.test.mjs` includes cart storage, quantity, totals, subscriber isolation, hydration snapshot, updated-price, and clear-state tests. `tests/product-cards.browser.mjs` additionally exercises add/remove, persistence across refresh, navigation, totals, the 99 cap, invalid/corrupt storage, blocked storage, decrement-to-remove, empty recovery, confirmation focus, native keyboard trapping/Escape, detail-page add, feedback, existing checkout navigation, and mobile/RTL drawer sizing. It observes no hydration errors. Use a dedicated Chrome profile outside `.next` to avoid interfering with build cleanup. Real-device testing and final visual comparison remain outstanding.
## Demo checkout

`/checkout` remains a thin Server Component. It loads the existing validated collection/fallback and registers those server-provided product prices with the persistent browser cart. Route loading and the cart restoration state show an accessible Loading your bag message. Collection failures retain the same local fallback; browser effects do not fetch product data.

The source checkout schema and demo completion functions are retained in `checkout-schema.ts` and `checkout-logic.ts`. The original EN/AR/TR messages and stable error-code mapping are in `checkout-messages.ts`; the current UI uses English without adding language switching. Only the original required form dependencies were installed: `react-hook-form@7.91.0`, `@hookform/resolvers@7.0.3`, and `zod@4.6.7`. Native inputs/buttons use the existing Tailwind tokens, avoiding unrelated shadcn utilities and dependencies.

Validation trims text and preserves the original rules: name 2–100 characters; valid email up to 254; optional phone up to 30 with at least seven Unicode decimal digits when supplied and the original permitted punctuation; address 3–200; city 1–100; postal code 1–20; country 2–100; and a required true demo acknowledgement. React Hook Form uses the single Zod schema with submit-time validation, original errors, automatic invalid-field focus, submitting/busy/disabled states, and error description links. Email and telephone fields stay LTR.

Checkout has the original empty-cart message and Back to Home link, contact/delivery form, editable bag summary, free-shipping progress, and demo success screen. Cart item UI is shared with the drawer in `cart-item.tsx`. The form fields become two columns at 701px, and form/summary become two columns at 901px. Existing shared-container and final visual differences remain deferred.

Success rechecks live cart quantities, resets only the form, focuses the success heading, and holds a historical receipt containing count and subtotal only. The cart and its storage remain unchanged. Review again starts with blank fields and an unchecked acknowledgement; Back to shop retains the bag. There is no order ID, payment, order API, personal-data persistence, or artificial submission delay. Emptying the cart during validation does not create a receipt or reset the form.

`tests/checkout.test.mjs` adapts the original checkout tests to the migrated cart controller. Tests cover schema limits/international input, the RHF resolver/submission state, cart retention, no personal data in receipts, current-price totals, and the cart-emptying race. Browser checks cover empty state, responsive layouts at 375/768/1440px, exact error messages, invalid-field focus/ARIA, acknowledgement enforcement, valid success/reset, unchanged saved cart, no submission request, live summary quantity/removal controls, navigation, and hydration. Real-device and final pixel-parity checks remain outside this migration step.
## Demo signup

`/signup` remains a Server Component and renders a small `SignupForm` Client Component. The original `submitSignupDemo` handler is preserved in `signup-submit.ts`; native constraint configuration is centralized there. The original signup did not use React Hook Form or Zod, so this migration adds no dependency and does not replace browser validation with a different schema.

The form restores the required email input, required password with minimum length eight, email/new-password autocomplete, LTR email direction, password hint, native validation/error focus, and original source copy. Invalid input stays unchanged and produces no success feedback. Valid submission prevents navigation, asks the browser to report validity, resets the native form, then announces the original demo success message for 2600ms. It does not read the credential values, create accounts, authenticate, make a request, write storage, or add artificial asynchronous loading/error states. EN/AR/TR copy is retained in `signup-messages.ts`; language switching remains deferred.

Because the source SPA never presents this form without JavaScript, the Next.js SSR form keeps its fieldset disabled until hydration supplies the client submit handler. Server and first browser snapshots match. This prevents a pre-hydration/no-JavaScript native POST while retaining the source form's POST method and normal native validation once interactive. No account endpoint or Server Action was introduced.

Feedback is locally scoped to the signup form; shared notification/UI consolidation and final visual parity remain deferred. The existing Tailwind tokens, 480px form maximum, native controls, associated labels, password description, live status, and 16px mobile inputs are used. Cart, checkout, and product API implementation files were not changed.

`tests/signup.test.mjs` retains the original invalid/valid submission tests, including reset-before-notification and never-reading-credentials checks, plus the native constraint contract. Browser tests verify required/type/minimum-length validity, browser error messages and focus, keyboard submission, native reset, success timeout, unchanged browser storage, no submission request or URL parameters, navigation, responsive layouts at 375/768/1440px, the disabled SSR fieldset, and absence of hydration errors. Existing catalog/cart/checkout checks also pass. Real-device and final visual comparison remain outstanding; no new confirmed bug was discovered during this step.

## Localization and RTL

`src/features/i18n/` restores the source English, Arabic, and Turkish dictionaries, product translation helpers, formatting, document metadata, and language selector. Checkout retains its existing shared dictionary; signup projects its messages from the main dictionary. Dictionary comparison verifies that the original translations are retained. This supersedes the English-only descriptions in the earlier migration notes above.

Each root `LanguageProvider` owns its language controller. Server rendering and initial hydration use the original English default; the raw language string in `shopboard-language` is restored after hydration without overwriting the saved preference. Invalid preferences fall back to English. Unavailable storage still permits in-memory switching. There is no global mutable server language, locale URL parameter, cookie, or page reload. A saved non-English preference is applied after hydration, so the initial server HTML remains English.

The provider updates document language, direction, title, and description on language or route changes. Arabic uses RTL and the existing Arabic font tokens; English and Turkish use LTR. The wordmark remains English/LTR, while email and telephone fields retain their input direction. Catalog controls use the original Arabic responsive layout. Existing logical card/cart positioning and shared design tokens remain intact.

Navigation, route text, catalog controls/results/feedback, product content and image descriptions, cart, checkout, signup, loading, error, and empty states consume shared translations. Product card/detail presentation now uses Client Components to react to language changes; routes still fetch and validate products on the server and pass serializable product props. API translation validation and fallback behavior are unchanged. Cart notices store message keys so active feedback can change language without restarting its timer.

Language changes do not key or remount forms, dialogs, cart, or catalog providers. Query/category/sort values, cart quantities, open confirmation state, focus, typed fields, validation errors, and active feedback survive switching. Checkout error codes translate at render time. Signup keeps the source native browser validation behavior; browser-owned validation bubbles use the browser's locale.

Localization coverage includes dictionary completeness, interpolation, product/number/currency formatting, metadata, provider isolation, safe persistence, and hydration snapshots. Chrome checks exercise all three languages, responsive RTL/LTR layouts, catalog state, open dialogs/focus, translated products, form values/errors/success, saved-language/cart restoration, invalid preferences, blocked storage, navigation, and hydration. Final visual parity, shared UI consolidation, and real-device checks remain deferred.

## Shared Button

`src/components/ui/button.tsx` exports `Button`, `ButtonProps`, `ButtonVariant`, and `ButtonSize`. It renders a native button and forwards native attributes, events, ARIA attributes, and React 19 refs. Its default `type="button"` prevents accidental form submission; forms must explicitly pass `type="submit"` or `type="reset"`. It adds no client boundary of its own; interactive callers remain Client Components.

Variants are `primary` (burgundy), `secondary` (soft beige/cream), `outline` (transparent with the existing border token), and `danger` (chocolate with cream text). Destructive actions still need clear labels. Sizes are `sm` (44px minimum), `md` (48px minimum, default), and `lg` (56px minimum). Disabled controls use the native disabled attribute and existing 45% opacity; focus-visible outlines use the ring token. Icon-only buttons must provide an accessible name. `className` supports additional layout styling; it does not perform Tailwind conflict merging.

Cart item and dialog controls currently reuse `variant="outline" size="sm"` to retain their existing dimensions and colors. Product overlays, header bag, form actions, and catalog controls remain separate pending review. Run `node --test tests/button.test.mjs` for native-prop/ref forwarding, variant/size coverage, and strict prop-type checks. The type fixture is compiled in memory and creates no source file.

## Shared Input

`src/components/ui/input.tsx` exports `Input`, `InputProps`, `InputVariant`, and `InputSize`. Variants are `default` (cream surface, control radius) and `outline` (transparent surface, compact radius, checkout focus ring). Visual `controlSize` accepts `sm`, `md` (default), or `lg`, with minimum heights of 44/48/56px plus the existing padding. The separate native `size` remains numeric. All sizes retain 16px input text.

Native constraints, controlled/uncontrolled values, events, React 19 refs, disabled/read-only state, direction, and ARIA attributes pass through to the native input. React Hook Form's `register()` props can be spread directly. `invalid` sets `aria-invalid="true"`; otherwise a supplied native `aria-invalid` value is preserved. It does not run validation or generate error text. Callers provide labels and connect hints/errors using `aria-describedby`. Styling uses the existing ring and primary tokens for keyboard focus and invalid state. The component introduces no client boundary or internal state.

Signup email/password fields use the defaults; checkout text/email/telephone fields use `variant="outline" controlSize="sm"`. The checkbox and catalog search remain native. `className` is additive and does not merge conflicting Tailwind classes. Run `node --test tests/input.test.mjs`; browser checks additionally verify original field geometry, RHF error focus, native constraints/reset, disabled state, and language/direction preservation.

## Shared Card

`src/components/ui/card.tsx` exports `Card`, `CardProps`, `CardElement`, `CardVariant`, and `CardPadding`. It defaults to a neutral `div`, with `as="section"`, `as="article"`, or `as="aside"` available when the content warrants those semantics. Native HTMLElement attributes, children, events, and React 19 refs are forwarded. Supply meaningful headings/accessible names for labelled sections; the component does not add a role, tab stop, or click behavior. A caller-provided `tabIndex` can use the existing focus-ring styling. It introduces no client boundary.

Variants are `default` (cream), `soft` (the existing soft surface), and `outline` (transparent). All use the existing border token and Tailwind's 16px `rounded-2xl` radius. Padding accepts `none` (0), `sm` (16px), `md` (20px, default), `lg` (24px), or `responsive` (the original `clamp(24px, 4vw, 48px)`). `className` is additive without Tailwind conflict merging.

Shipping's two information sections and availability aside, plus Shop's fallback and empty-results panels, reuse Card without changing their semantic tags or state logic. ProductCard remains a separate feature component; Philosophy, signup, and checkout summary keep their distinct shapes/padding. Run `node --test tests/card.test.mjs` for semantic/ref/native-prop coverage, all variant/padding combinations, strict prop checks, and migrated Shipping usage.

## Shared Badge

`src/components/ui/badge.tsx` exports `Badge`, `BadgeProps`, `BadgeElement`, `BadgeVariant`, and `BadgeSize`. It defaults to `as="span"`; `as="bdi"` is available for content that needs inline directional isolation. Native attributes, events, children, and React 19 refs pass through. Callers supply localized content and any necessary accessible description. Badge adds no role, live region, tab stop, interaction, or client boundary.

Variants are `default` (burgundy), `soft` (beige with the existing border), and `outline` (transparent). Sizes are `sm`, `md` (default), and `count` (the original 23px circle with 10px tabular numerals). All use existing design tokens and Tailwind utilities; `className` is additive without conflict merging. The header cart count uses `soft`/`count`, retaining its parent button's localized accessible name and action. Plain product-category paragraphs remain feature content, without introducing a new chip design. Run `node --test tests/badge.test.mjs`; responsive browser tests verify the migrated count's dimensions, typography, colors, and semantics in EN/AR/TR.

## Shared Modal

`src/components/ui/modal.tsx` exports `Modal`, `ModalProps`, and `ModalSize`. It is a Client Component using a native `dialog` and `showModal()` for top-layer semantics, background inertness, and focus containment. Visibility is controlled by required `open` and `onOpenChange` props; `open` is not rendered as a native attribute. Supply `aria-labelledby` or `aria-label`, meaningful content, and an accessible close control. Native dialog attributes/events and React 19 object/callback refs are supported. Do not independently call `showModal()` through the ref; change the controlled state.

Sizes are centered `sm`, `md` (default), `lg`, or the existing responsive 480px `drawer`. Styles use existing tokens and Tailwind utilities. Escape and outside-backdrop clicks request `onOpenChange(false)`; `closeOnBackdropClick={false}` disables backdrop dismissal. Native `onCancel`/`onClick` handlers may prevent the corresponding dismissal. Native close events synchronize controlled state. Closing or unmounting restores the connected opener, optionally overridden by the `restoreFocusTo` CSS selector, with opener fallback. Existing global `body:has(dialog[open])` handles scroll locking.

CartDialog uses `size="drawer"` and restores focus to `#open-cart`. Cart state, confirmation content, and focus changes after confirmation/removal stay feature-specific. No custom focus trap, portal, extra visibility state, or nested confirmation modal is added. Run `node --test tests/modal.test.mjs`; production browser checks cover Tab/Shift+Tab, Escape, backdrop clicks, focus restoration, responsive drawer geometry, localized open confirmations, and hydration.

## Tailwind-only source styling

`src/app/globals.css` is the only CSS file in `src`, imported only by the root layout. It contains Tailwind configuration, reusable utility definitions, design tokens, language font defaults, keyboard focus defaults, and native-dialog scroll locking. Home catalog presentation lives in `interactive-catalog.tsx`: wrapper/result margins, coffee control borders, the original SVG search background with logical padding/RTL positioning, label typography, and one/two/three-column controls at 701px and 1101px. Home and Shop reuse the same select styling. `home-page.css` and its import were removed after checking its active rules. No tokens, animations, other Home sections, product cards, or business logic changed.

`node --test tests/styling.test.mjs` checks the single-stylesheet/import policy and prevents inline/embedded-CSS replacements in the migrated files. The main browser suite checks Home in EN/AR/TR at 320, 375, 399, 400, 700, 701, 768, 900, 901, 1100, 1101, and 1440px. For a future matched comparison, start the production app on 3107 and CDP Chrome on 9224, then run `node tests/home-styling.browser.mjs record` before changes and `node tests/home-styling.browser.mjs compare` after rebuilding. It saves full-page screenshots and geometry/computed-style baselines in ignored `node_modules/.cache/home-styling-audit`. It requires a ready catalog state and reports screenshot hashes separately from geometry assertions.

This migration matched measured styles/geometry in all 36 language/viewport cases. Thirty-five full-page screenshot pairs were byte-identical; the English 900px pair differed in product-image pixels despite matching geometry/styles. Exact pixel parity for that pair is not established; the images remain available for review. This comparison is against the pre-migration Next.js appearance, not a new claim of parity with the original React application.

## Light, dark, and system themes

The CSS-first palette in `src/app/globals.css` keeps the original light values and routes component utilities through semantic variables for page/background text, brand/action colors, soft and accent surfaces, borders, control borders, focus rings, danger states, overlays, image outlines, footer text, and card shadows. The dark palette uses a deep brown-black surface, warm cream text, and rose/beige brand colors. Product cards gain a subtle dark outline; inputs, cards, modal/backdrop, header/footer, feedback, form errors, disabled controls, and focus indicators inherit the same semantic tokens. `globals.css` remains the only source CSS file.

Theme preference is `system`, `light`, or `dark` and is stored as the raw value under `shopboard-theme`. System is the default and follows `prefers-color-scheme` live; explicit light/dark choices ignore later system changes. Storage failures retain an in-memory choice. The provider is local to the root tree and its controller reattaches its media listener during React Strict Mode effect replay.

The parser-executed initializer in the root document head validates the stored value and sets the theme before body paint. System color scheme remains CSS-driven. The root suppresses only its expected pre-hydration theme-attribute difference; UI content retains normal hydration checking. The header's 44px theme button cycles System → Light → Dark and includes localized EN/AR/TR current/next-state text through its accessible name and title. The smaller mobile language selector leaves both controls and the bag action within the 320px header.

`tests/theme.test.mjs` covers validation, persistence, blocked storage, system changes, Strict Mode listener replay, document application, pre-hydration initialization, toggle states/localization, and semantic tokens. `tests/theme.browser.mjs` verifies the saved-dark first frame, all preference transitions, persistence/reload, live system changes, explicit-choice precedence, every route, shared surfaces, native modal/backdrop, form validation, contrast, keyboard focus, EN/AR/TR, RTL/LTR, and 320/375/768/1440px layouts. The full storefront browser suite remains pinned to explicit light mode so its original visual measurements continue to detect light-theme regressions.
