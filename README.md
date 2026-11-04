# VivaSim

**Danii's VivaSim — survive your viva before it happens.**

## Status

Early **offline/browser MVP** (not production-ready and not an AI-powered examiner yet). This branch adds a working five-question practice flow, TXT/MD or pasted report input, browser-local autosave, simple transparent heuristic feedback, and JSON results export. The original Codex application source is not recovered.

## Run locally

Prerequisites: modern browser, Python 3 to serve ECMAScript modules, Node.js 20+ to run tests.

```bash
python3 -m http.server 4173
# open http://localhost:4173
npm test
npm run check
```

No dependencies are installed and no remote requests are made by the practice application.

## Privacy and limitations

Reports and answers remain in the current browser's localStorage; they are not encrypted. Do not use shared devices for confidential reports without clearing local data. No accounts, uploads to a server, voice, payment services, LLMs, or factual AI scoring are implemented. The scoring algorithm is a basic practice heuristic only; it does not verify correctness.

## Engineering

See [AGENTS.md](AGENTS.md), [docs/ROADMAP.md](docs/ROADMAP.md), [docs/CHECKPOINTS.md](docs/CHECKPOINTS.md), and [docs/CODEX_RECOVERY_PLAYBOOK.md](docs/CODEX_RECOVERY_PLAYBOOK.md). Work on feature branches, open PRs, run tests, and verify remote commits before switching laptops.
