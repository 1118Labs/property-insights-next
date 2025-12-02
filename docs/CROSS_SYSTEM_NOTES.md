# Cross-System Notes (apply to sister repo separately)

- Add reusable ingestion logging helper + registry for cron tasks; keep logging non-blocking and guarded by env configuration.
- Harden enrichment providers with retries, validated numeric parsing, and safe fallback merges; surface warnings in API responses without failing the request.
- Strengthen scoring heuristics with configurable weights, richer risk flags (unknown age, minimal sqft), and unit tests comparing modern vs dated properties.
- Add skeleton/loading states to insight summary components (score badge, stats grid, insight card) to improve perceived performance without altering layouts.
- Ensure Jobber request edges are validated before ingestion; track token staleness and include status in API responses.
- Aerial enrichment scaffolding (geocode → tile fetch → segmentation → heuristics) is implemented with caching and provider metrics; the same structured stub could support map-preview or geo heuristics in the sister product without external dependencies.
