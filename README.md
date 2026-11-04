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

Remaining Phase 1 work: optional OCR, native provider adapters and shared production rate limiting. Live-provider behavior is unverified without credentials. The full AI examiner, scoring rubric, speech transcription, adaptive sessions, cloud synchronization and social tools belong to subsequent phases. The old application from the exported conversation is still unrecovered.

## Validation and manual QA

Automated checks cover engine functions, extraction validation, provider fallback and data-message isolation, browser draft restoration, consent, offline practice, API rejection, and mobile axe checks. Mocked prompt-injection tests validate message separation, not a live model's resistance.

Manual checks still required: Chrome Android, Safari iOS, Samsung Internet, Firefox, real complex/scanned/password-protected PDFs, slow 3G, Urdu input, screen-reader navigation and Lighthouse performance budgets. No production deployment has occurred.

## Project preparation and voice rehearsal

Optional title, subject and study level are saved locally and included as untrusted context with consented AI review. Editing them resets consent. Delete local draft clears these details too. Balanced excerpt previews distribute the word/character budget across detected sections (or paragraphs), retain source order and require explicit application. They are extractive, may omit evidence, and need human review.

Offline practice offers local question read-aloud and up to three minutes of microphone recording with replay. Recordings remain in tab memory and are discarded on question changes or page exit. No audio is uploaded, transcribed or scored; type the answer for heuristic feedback. A local English voice and browser microphone support are required; typed practice remains available. Mobile controls have touch targets and wrapping layouts.

### Optional browser dictation

Practice now offers English speech-to-text where the browser SpeechRecognition API is available. It requires explicit consent for each question: the browser vendor may process microphone audio remotely, under its policies. Recognition is separate from local audio recording. Transcripts are capped at 5,000 characters, editable after stopping, and added to the answer only on request. Consent withdrawal, question changes and page exit invalidate late speech results. Backgrounding the tab stops recognition. Unfinished answers are saved locally for refresh recovery; clear practice data removes them.

Speech lifecycle tests use a deterministic recognition mock; they do not verify a real vendor service or its accuracy. Real-device Chrome/Safari recognition and microphone QA remain necessary. No paid transcription service is configured.

### Saved session history

Completed practice sessions are saved to IndexedDB on the current device, with up to 50 sessions. History stores project title, questions (including any quoted report excerpts), submitted answers, completion time and heuristic scores. Raw reports, audio and unsubmitted drafts are not copied into history. The active practice draft remains separately stored in localStorage.

View saved feedback without replacing the current draft, export individual sessions as JSON, delete individual sessions or delete all history. Save session retries failed saves without creating duplicates. Full history rejects new entries instead of evicting older work. Clear local data removes both the current practice state and all history; the home editor draft remains separate. Storage is unencrypted, device-specific and subject to browser eviction—export backups. There is no cloud account or synchronization.
