# Client Portal (Omega Build 7)

## Overview
- Passwordless, token-based client portal with shareable links for insights/quotes.
- Tokens expire after 7 days and can be approved/changed via API.
- Safe mode: set `PORTAL_DISABLED=true` to disable portal endpoints.

## Domain
- `PortalInvite`, `PortalSession`, `PortalViewState` in `lib/portal/domain.ts`.
- Stored in-memory for demo/testing; one-time token created via invite endpoint.

## Branding
- Defaults in `lib/portal/config.ts` (logo, primaryColor, CTA label).

## APIs
- `POST /api/portal/invite` — body `{ clientId, propertyId, quoteId? }` (admin-only if `ADMIN_SHARED_SECRET` set).
- `GET /api/portal/verify?token=...` — returns session or error.
- `POST /api/portal/approve` — body `{ token }` or header `x-portal-token`.
- `POST /api/portal/request-changes` — body `{ token }` or header `x-portal-token`.

## Routes
- `/portal/[token]` — combined insights + quote view with approve/changes buttons.
- `/portal/[token]/insights` — read-only insights.
- `/portal/[token]/quote` — read-only quote view + approve/changes.
- Loading skeletons and expired-token not-found fallback.

## Components
- `ClientPortalLayout` — header/footer/branding.
- `ClientInsightCard` — simplified insight summary.
- `ClientQuoteView` — quote totals/items + upsells + actions.

## Activity tracking
- In-memory `PortalActivityStore` records verify/approve/change actions.

## Middleware
- `middleware.ts` extracts token from portal URLs and injects `x-portal-token` header for downstream handlers.

## Tests
- `tests/portal.test.ts` covers invite/verify/approve flows.

## Future work
- Persist portal tokens + audit logs in Supabase.
- Email delivery for invites/approvals and configurable branding per workspace.
