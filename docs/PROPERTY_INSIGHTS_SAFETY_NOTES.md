# Safety Notes

- Debug Panel UI requested but deferred to avoid touching restricted routing/layout areas. Implement within allowed components once a designated placeholder is available.
- Added loading.tsx skeletons for /properties, /admin, and /admin/property-test; pages remain unchanged otherwise.
- Deep linking for /properties/[id]?tab=insights/photos/map requires page-level routing changes, which are restricted per current scope. Not implemented.
