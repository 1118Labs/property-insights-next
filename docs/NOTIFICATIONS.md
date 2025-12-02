# Notifications & Webhooks (Omega Build 8)

## Engine
- Dispatchers for `email`, `sms`, and `webhook` with pluggable config in `lib/notifications/engine.ts`.
- Safe mode: `NOTIFICATIONS_DISABLED=true` disables sending.
- Config: `/api/notifications/config` supports `webhookUrls`, `fromEmail`, `smsFrom`.
- Store: `lib/notifications/store.ts` tracks sends + metrics (successRate, avgSendTime).

## Triggers
- Events wired: quote approved, job scheduled (via portal approve/job-slot create). `triggerEvent` posts to configured webhook URLs.

## Templates
- Stub HTML/SMS templates implied; webhook payloads are JSON with event + payload.

## Webhooks
- Test endpoint: `/api/webhooks/test-endpoint` echoes payload.
- Notifications send POST to configured webhook URLs with retries stubbed (in-memory).

## CRM
- Stub connectors for HubSpot, Pipedrive, Zoho at `lib/crm/stubs.ts`; test via `/api/crm-sync/test`.

## UI
- Placeholder admin widgets: NotificationLog, WebhookLog, CRMStatusCard.

## Safe mode
- Global disable via env; platform-health returns notifications status.

## Tests
- `tests/notifications.test.ts` covers webhook dispatch + event trigger.
