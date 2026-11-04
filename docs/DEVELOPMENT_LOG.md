# Development log

## 2026-11-03
Inspected the existing GitHub repository and exported Codex transcript. The `main` branch only contained README; prior application is not in the remote default branch. Created a separate foundation branch and supplied engineering documentation, minimal workflow and recovery instructions. Next: verify remote files, open a PR, recover old source, then configure and publish cloud environment.

## 2026-11-04 — Phase 1 implementation

Added Next.js/TypeScript foundation, browser document extraction, draft editor, privacy page, optional consent-gated provider review with local fallback, and tests. Original offline MVP remains available through generated public assets. Verified production build, TypeScript, 15 unit cases, and five Chromium browser cases including PDF/DOCX and axe in both themes. Live AI, other browsers, OCR and distributed production limits remain unverified or unimplemented. No deployment. See README for explicit scope and setup.

## 2026-11-04 — PR #5 review

Reviewed the report editor, extraction, provider boundary, API, privacy statements, offline handoff and CI. Fixed mismatched character/byte limits that rejected valid Unicode reports and silently truncated long drafts on entering practice. Added explicit 80,000-character trimming alongside the 8,000-word limit; the bounded JSON envelope now accommodates Unicode and escaped text. Added a ten-second request-body deadline to release stalled upload slots. Saved practice sessions now require confirmation before replacement, and clearing practice data handles unavailable storage.

Added regression coverage for streamed body limits, stalled uploads, Unicode API input, explicit character trimming and preserving saved answers when replacement is canceled. Production dependency audit reported zero known vulnerabilities. Public deployment still requires shared rate/budget controls and live-provider validation; README lists remaining Phase 1 features and manual browser checks. No merge or deployment performed.

Review validation completed: `npm run check`, `npm run build`, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` passed (8 browser cases, including PDF/DOCX extraction and mobile axe in both themes). `npm audit --omit=dev` reported 0 vulnerabilities. GitHub checks must also pass on the review-fix commit before merge.
