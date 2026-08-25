# Handoff: Public Team-Merch Order Form (redesign)

## Overview
Modernized public order form for team apparel (rhythmic gymnastics / girly-sports clubs). Replaces the current `PublicOrderForm` page: a photo-forward product grid, a slide-in product detail view (Freddy-style shop pattern), a cart with personalization, contact details, submit → success screen, plus closed-form state and size-chart dialog.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, not production code to copy directly. The task is to **recreate this design in the existing Next.js codebase** (App Router, Tailwind v4, React client component + server action) using its established patterns. The prototype's logic class (bottom `<script>` in the `.dc.html`) intentionally mirrors the existing `PublicOrderForm.tsx` state model so the port is mostly styling + one new view.

## Fidelity
**High-fidelity.** Recreate pixel-perfectly, mapping raw values to Tailwind utilities / CSS variables as listed under Design Tokens. Product photos are placeholders (drag-drop slots) — real `item.images` go in their place.

## Design system: "Modernist"
- Flat and architectural. **Zero border-radius anywhere.** No decorative gradients.
- Font: **Archivo** (Google Fonts, weights 400/600/800). Headings weight 800, letter-spacing -0.015em.
- Light gray ground `#f3f2f2`, surface `#eae9e9`, ink `#201e1d`.
- Strong **2px dividers** (`color-mix(in srgb, #201e1d 40%, transparent)`) between major sections; 1px for row rules.
- Everything **flush left**, including labels inside full-width buttons.
- Product photography renders **grayscale** (`filter: grayscale(1) contrast(1.08)`).
- Uppercase 13px kickers (`h6` style: letter-spacing .08em) introduce sections, colored `--color-accent-700`.
- `styles.css` in this bundle is the complete token + component sheet (`.btn`, `.input`, `.field`, `.seg`, `.tag`, `.card`, `.nav`, `.table`, `.dialog`, `.hr` classes). Port these as Tailwind component classes or copy the sheet.

## Brand theming (per team, NOT hardcoded)
One variable drives the accent: `--brand` = `team.brandColors.primary` (prototype default `#e0a400`; client also liked `#d4649c`). Derived steps via `color-mix`:
```css
--color-accent:      var(--brand);
--color-accent-100:  color-mix(in oklab, var(--brand), white 88%);  /* tag fill */
--color-accent-200:  color-mix(in oklab, var(--brand), white 72%);
--color-accent-600:  color-mix(in oklab, var(--brand), black 12%);  /* hover */
--color-accent-700:  color-mix(in oklab, var(--brand), black 35%);  /* kickers, errors, links */
--color-accent-800:  color-mix(in oklab, var(--brand), black 50%);  /* text on tag fill */
```
Text on solid accent fills is ink `#201e1d` (not white) — brand colors are light.

## Screens / Views
Single page, max-width 480px centered column on `#f3f2f2` desktop ground, `shadow-md` on the column. Mobile-first.

### 1. Shop (default view)
- **Nav bar**: team name (Archivo 800, 18px) left, tag "Closes {date}" right (`--color-accent-100` fill, `--color-accent-800` text, 11px, nowrap). 2px bottom border.
- **Intro** (padding 20px): kicker "TEAM KIT ORDER", h3 title (25px/800), 13px muted body line.
- **Product grid**: 2 columns, gap 16px vertical / 12px horizontal, padding 16px 20px. Each card: surface `#eae9e9` background, 3:4 grayscale product image, then 10-12px padded footer — name (Archivo 800, 14px), size range muted 11.5px left / price 600 13px right. Whole card clickable → opens detail.
- **Your order** section after a 2px `hr`: kicker "YOUR ORDER"; empty state = muted 13px line. Cart rows: label ("Team T-Shirt · M × 2") 13px/600 + personalization values as 11.5px muted sub-line; price right; 30px square remove button (×, outlined). 1px row rules; **Total** row Archivo 800 16px with 2px bottom rule.
- **Contact**: kicker "CONTACT"; Full name* full-width; Phone* / Email(optional) in a 2-col grid (gap 12px); Notes textarea. Field pattern: 12px label at 70% ink, input on surface bg, 1px divider border, min-height 36px, accent caret; focus = accent border + 2px accent outline.
- **Submit**: full-width `.btn-primary` (accent fill, ink text, label flush LEFT), min-height 46px, label "Submit order — €{total}". 11px muted note below.
- **Sticky bottom bar** (only when cart non-empty): fixed, same 480px width, surface bg, 2px top border, contains a primary button "Review order ({count})" left / total right → smooth-scrolls to summary.

### 2. Product detail (slide-in overlay)
- Fixed overlay, same 480px column, slides in from the right over the shop. Shop stays mounted → **all form/cart state and scroll position preserved** on back.
- **Top bar** (sticky): ghost button "‹ Back to order" (chevron-left Lucide icon), 2px bottom border.
- **Gallery**: grid `2fr 1fr`, 2px gaps — large 3:4 front image left; back + detail thumbnails stacked right. All grayscale. (Map to `item.images[0..2]`.)
- **Title row**: h3 name left, price Archivo 800 20px right (updates with size adjustment).
- 13px muted description.
- **Size**: "SIZE" kicker left, ghost "Size chart" button right (only if `item.dimensions.length`). Segmented control of size options (44×38px min cells, 1px dividers between); selected cell = solid accent fill, ink text. Optional muted note under ("2XL adds €2.00").
- **Personalization**: one `.field` per `item.personalization` entry, label + `*` or `(optional)`; numeric fields strip non-digits; required-empty shows 12px error in `--color-accent-700`.
- **Qty + Add row**: stepper (− / count / +, 44px tall segmented) + flex-1 primary button "Add to order — €{unit×qty}".
- Add → validates personalization, merges identical lines in cart, resets qty/personalization, slides back to shop, shows toast.

### 3. Success
Nav + kicker "ORDER RECEIVED", h2 "Thank you, {firstName}.", muted explainer, surface card (shadow-sm) with kicker "REFERENCE", reference in Archivo 800 28px, meta line with total; secondary full-width "Place another order" (clears cart+notes, keeps contact).

### 4. Closed / not open yet
Nav + kicker, h2 "Orders are closed.", muted body with deadline, 2px hr, contact meta line. (Driven by `form.status` / `isFormAcceptingOrders`.)

### 5. Size chart dialog
Backdrop `color-mix(neutral-900 50%, transparent)`, centered dialog (`min(440px,100%)`, surface bg, shadow-lg, no radius). Title "Size chart — {name}"; `.table`: uppercase 11px headers with 2px bottom rule, dimension columns right-aligned "{Label} (cm)", 1px row rules. Secondary Close button right-aligned; backdrop click closes.

### Toast
Fixed bottom-center (above sticky bar), ink `#2d2b2b` bg, light text 13px, no radius, fade+rise in 250ms, auto-dismiss 2.2s. Copy: "{name} · {size} × {qty} added".

## Interactions & Behavior
- Card tap → detail slides in: `transform: translateX(100%→0)`, **380ms cubic-bezier(.32,.72,.24,1)**. Back reverses it. Implementation note: overlay must be fully off-viewport when closed on wide screens (prototype uses `translateX(calc(50vw + 51%))`; in production `translateX(100%)` inside an `overflow-x: clip` full-width wrapper is cleaner).
- Detail state per product is kept in a `selections` map (size, qty, personalization) — reopening a product restores its in-progress selection.
- Cart merge rule: same product + size + identical personalization ⇒ quantity increments; otherwise new line.
- Validation on submit: name required; phone required per `form.requiredMemberFields.phone`; email format-checked when present / required per config; cart non-empty. Errors inline under fields, `--color-accent-700`, 12px.
- Submit disables button, label "Submitting…", calls `submitPublicOrder(form._id, { member, notes, lines })` (same payload as today), then success view + `window.scrollTo({top: 0})`.
- Buttons: hover `--color-accent-600` fill (primary) / 7% ink tint (secondary, ghost); active one step darker; `:focus-visible` = 2px accent outline, offset 2px. Never default blue focus ring.
- Keep the existing BG/EN dictionary — all copy above goes through `dict`.

## State Management
Direct port of existing `PublicOrderForm` state, plus:
- `view: 'shop' | 'detail'` and `detailId: string | null` (new)
- `chartOpen: boolean` (replaces `chartItem` — chart always shows the open detail product)
- unchanged: `selections`, `cart`, `fullName/phone/email/notes`, `fieldErrors`, `submitError`, `submitting`, `success`, `toast`.

## Design Tokens
- Colors: bg `#f3f2f2` · surface `#eae9e9` · ink `#201e1d` · divider `color-mix(in srgb,#201e1d 40%,transparent)` · muted text = ink at 55% · neutral-900 `#2d2b2b` · accent = per-team `--brand` + color-mix ramp above.
- Type (Archivo): h2 32px, h3 25px, kicker 13px/800/uppercase/.08em, card title 14-17px/800, body 13px, labels 12px, meta 11-11.5px, price-lg 20px/800, reference 28px/800.
- Spacing: 4/8/12/16/24/32 scale; page padding 20px; section rhythm via 2px `hr` + 16-20px padding.
- Radius: **0 everywhere**. Shadows: sm `0 1px 2px 14%`, md `0 3px 10px 16%`, lg `0 12px 32px 22%` (ink-tinted).
- Hit targets ≥ 44px (size cells, steppers, primary buttons).

## Assets
No bundled imagery — all product photos are drop-slot placeholders; use `item.images` from the Form model, rendered through the grayscale filter. Icons: Lucide (`chevron-left`, optionally `x` for remove/close).

## Files
- `Order Form Prototype.dc.html` — the interactive prototype (markup in `<x-dc>`, state logic in the trailing script; ignore the runtime `support.js` / `image-slot.js` scaffolding).
- `styles.css` — the full Modernist token + component stylesheet the prototype consumes.
