# Development log

## 2026-11-03
Inspected the existing GitHub repository and exported Codex transcript. The `main` branch only contained README; prior application is not in the remote default branch. Created a separate foundation branch and supplied engineering documentation, minimal workflow and recovery instructions. Next: verify remote files, open a PR, recover old source, then configure and publish cloud environment.

## 2026-11-04 — Phase 1 implementation

Added Next.js/TypeScript foundation, browser document extraction, draft editor, privacy page, optional consent-gated provider review with local fallback, and tests. Original offline MVP remains available through generated public assets. Verified production build, TypeScript, 15 unit cases, and five Chromium browser cases including PDF/DOCX and axe in both themes. Live AI, other browsers, OCR and distributed production limits remain unverified or unimplemented. No deployment. See README for explicit scope and setup.

## 2026-11-04 — PR #5 review

Reviewed the report editor, extraction, provider boundary, API, privacy statements, offline handoff and CI. Fixed mismatched character/byte limits that rejected valid Unicode reports and silently truncated long drafts on entering practice. Added explicit 80,000-character trimming alongside the 8,000-word limit; the bounded JSON envelope now accommodates Unicode and escaped text. Added a ten-second request-body deadline to release stalled upload slots. Saved practice sessions now require confirmation before replacement, and clearing practice data handles unavailable storage.

Added regression coverage for streamed body limits, stalled uploads, Unicode API input, explicit character trimming and preserving saved answers when replacement is canceled. Production dependency audit reported zero known vulnerabilities. Public deployment still requires shared rate/budget controls and live-provider validation; README lists remaining Phase 1 features and manual browser checks. No merge or deployment performed.

Review validation completed: `npm run check`, `npm run build`, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` passed (8 browser cases, including PDF/DOCX extraction and mobile axe in both themes). `npm audit --omit=dev` reported 0 vulnerabilities. GitHub checks must also pass on the review-fix commit before merge.

## 2026-11-04 — Project preparation and voice rehearsal

Continued Phase 1 with optional locally saved project metadata, schema-validated context for consented AI review, and previewable section-balanced extractive condensation. Added local-voice question read-aloud and in-memory microphone recording/replay to practice, with a three-minute limit, question-change cleanup and mobile touch controls. Audio is never uploaded or scored. Metadata edits reset AI consent; draft deletion clears metadata. Added unit and browser regression coverage.

Remaining: OCR, native provider adapters, distributed budgets/rate controls, live-provider verification, full AI examiner/rubric, transcription, durable session history and real-device browser QA. User priority is voice and mobile experience. No merge, environment publication or deployment authorized or performed.

Validation: `npm run check` and production build passed. Eleven Chromium cases passed together, and the additional microphone-denial case passed separately (12 browser cases total). Mobile axe checks passed in both themes; real-device Safari/Android voice behavior still needs manual verification.

## 2026-11-04 — Consent-gated browser dictation

Added optional English browser speech recognition with explicit per-question consent, separate editable transcript preview, append-only application to the answer, three-minute capture limit and 5,000-character transcript cap. Recognition may use a browser vendor service; UI and privacy copy disclose that. Consent withdrawal, question changes and backgrounding stop recognition; late results are ignored. Added unfinished-answer recovery across refresh and lifecycle tests using mocked recognition. Local recording remains separate. Real speech-service accuracy and real-phone behavior remain unverified; no merge or deployment.

Validation: type checks, unit/API tests, production build and all 17 Chromium browser cases passed. Five new browser cases cover consent, preview/application, answer recovery, revocation and stale events, question changes, speech permission failures and unsupported browsers. Speech responses are mocked; this does not establish real-provider accuracy or availability.

Follow-up: switching to local voice practice now preserves an unapplied transcript while withdrawing dictation consent. The added regression case passed locally, bringing the browser suite to 18 cases.
