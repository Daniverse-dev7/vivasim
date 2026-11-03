# Engineering decisions

## ADR-001: GitHub source of truth — 2026-11-03
Pushed commits are durable. Codex task workspaces and conversation HTML exports are not code backups.

## ADR-002: Non-destructive recovery — 2026-11-03
Use `chore/saas-foundation-20261103`; keep `main` untouched until changes are reviewed. Recover the older app before reimplementing.

## ADR-003: Privacy-first design (proposed)
Prefer browser-local reports and sessions, and disclose any excerpts sent to AI providers. Never log or commit sensitive user materials.
