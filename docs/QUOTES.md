# Quotes & Job Estimation (Omega Build 5)

## Domain
- `QuoteItem`: label, quantity, unit, unitPrice, total (+ optional metadata)
- `Quote`: id, propertyId, clientId, serviceProfile, items, subtotal, tax, total, notes, recommendedItems, confidenceWarnings, version, createdAt
- Schemas: `quoteSchema`, `quoteItemSchema` (Zod) live in `lib/quotes/quote.ts`.

## Pricing profiles
- Defaults per service type live in `lib/quotes/pricingProfiles.ts`.
- Override via env `PRICING_OVERRIDES_JSON` (stringified map) and `PRICING_TAX_RATE`.
- Runtime overrides via `/api/pricing-config` (POST) and read via GET.

## Quote builder
- `buildQuote(profile, serviceProfile)` uses enriched property data:
  - cleaning: sqft + beds/baths
  - lawncare: yard sqft, edging, tree density
  - roofing: roof area, pitch/access difficulty multipliers
  - painting: siding area, trim multiplier
  - window_washing: window counts, ladder difficulty
  - pressure_washing: driveway/walkway/siding
  - gutter_cleaning: linear footage
  - snow_removal: plowable sqft + frontage
  - pool_service: base + pool type
- Rounds sqft to nearest 25, applies complexity/urgency multipliers, tax from config, and caches by propertyId+serviceProfile+lastUpdated.
- Recommended upsells per profile included.
- Confidence warnings surface low insight confidence.

## Storage & versions
- In-memory quote store (`lib/quotes/store.ts`) supports versioning and audit log (timestamp, propertyId, serviceProfile, total). Version increments on save/update; latest returned by default.

## APIs
- `/api/quote/build` — build from propertyId or address; optional persist.
- `/api/quote/save` — save arbitrary quote payload (admin-protected when `ADMIN_SHARED_SECRET` set).
- `/api/quote/:id` — fetch latest or `?version=` to fetch specific.
- `/api/quote/:id/export` — HTML export (PDF-ready) using `lib/quotes/templates/base.ts`.
- `/api/quote/recalculate` — rebuild from latest insights.
- `/api/quote/compare` — compare two quotes.
- `/api/estimate-quick` — address → enrich → quote (not persisted).
- `/api/pricing-config` — view/update pricing overrides and tax rate.

## UI
- `QuoteGenerator` component on property detail for manual generation.
- `QuotePreviewCard` + `QuoteItemTable` display line items/totals.
- `QuickEstimateForm` (admin) performs non-persisted estimates by address.

## Exports
- HTML export endpoint returns client-friendly HTML string; downstream PDF generation can wrap this.

## Auto-generate
- `AUTO_GENERATE_QUOTES=true` triggers quote creation alongside enrichment; stored in in-memory store only.

## Tests
- Unit tests: quote builder basics, snapshot HTML, API smoke for build/export/get.

## Future work
- Persist quotes (Supabase) with per-workspace platform selection.
- Add configurable urgency/complexity inputs on UI.
- Add PDF generation wrapper and email delivery hooks.
