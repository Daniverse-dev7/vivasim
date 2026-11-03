# Proposed architecture

Browser (Next.js) → browser-side report extraction and local session persistence.

Browser → serverless application API → validated AI provider adapter.

Optional store for rate limits or aggregated metadata; no raw student reports or answers by default.

These are *design intentions*, not implemented functionality. Separate development/staging/production environments; use secret management, explicit retention rules and backup/rollback procedures before a release.
