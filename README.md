# Danii’s VivaSim

Survive your viva before it happens.

Phase 1 foundation built with Next.js App Router, TypeScript and Tailwind. PDF/DOCX/TXT/MD extraction runs in the browser. The editor supports local draft recovery, section detection, explicit trimming to 8,000 words and 80,000 characters, dark/light themes, and consent-gated report review. The existing five-question offline practice MVP remains available at `/practice`.

## Development

Use Node 22.13+ (validated with Node 24) and npm. Run `npm ci`, `npm run dev`, then open port 3000 locally. `npm ci` prepares the local PDF worker and copies the original offline app into generated public assets. No external fonts or extraction CDNs are required. Production: `npm run build` and `npm start`.

```sh
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
# If Chromium is already installed:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

## AI setup and current limits

Copy `.env.example` to `.env.local` and configure server-only credentials through secure environment settings. No keys are required for local practice. The optional review route supports an OpenAI-compatible primary and fallback endpoint, validates structured output, retries once, applies a 10-second timeout per request, and temporarily skips repeatedly failing providers. Native Claude/Gemini adapters, streaming and distributed budgets remain future work. Provider URLs are server configuration, never user inputs.

`POST /api/analyze` accepts `{report, consent:true}` and returns `{mode, summary, focusAreas, requestId}`. Missing providers or unsuccessful requests return a clearly labeled local section checklist. `GET /api/health` reports configuration presence only, not live provider health.

Request bodies are capped at 500 KB with a 10-second read deadline. The report limit is 8,000 words and 80,000 characters, shared with the editor and offline practice handoff.

The rate gate is global **per server instance** (10 requests/minute, two active requests). Shared Redis limits, durable budgets and bot protection are required before public deployment. No report or answer data is intentionally logged or persisted on the server. The provider processes consented text under its own policies. See `/privacy`.

## Phase status

Implemented: responsive foundation, browser extraction and preview, 10 MB cap, scanned/garbled-file guidance, 8,000-word explicit truncation, draft autosave/delete, sample session, privacy page, error boundary, validated review API with fallback and a basic rate gate. Drafts are stored unencrypted in localStorage.

Remaining Phase 1 work: optional OCR, section-aware condensation, project metadata fields, native provider adapters and shared production rate limiting. Live-provider behavior is unverified without credentials. The full AI examiner, scoring rubric, voice, adaptive sessions, IndexedDB history and social tools belong to subsequent phases. The old application from the exported conversation is still unrecovered.

## Validation and manual QA

Automated checks cover engine functions, extraction validation, provider fallback and data-message isolation, browser draft restoration, consent, offline practice, API rejection, and mobile axe checks. Mocked prompt-injection tests validate message separation, not a live model's resistance.

Manual checks still required: Chrome Android, Safari iOS, Samsung Internet, Firefox, real complex/scanned/password-protected PDFs, slow 3G, Urdu input, screen-reader navigation and Lighthouse performance budgets. No production deployment has occurred.
