# VivaSim engineering rules

Read `docs/PROJECT_CONTEXT.md`, `docs/ROADMAP.md`, and `docs/CHECKPOINTS.md` before making changes.

GitHub is the source of truth; Codex task filesystems are temporary. Before changing code, check branch, working tree, remote, and latest commit. Never reset or clean away uncommitted work. Work on short-lived branches and use PRs. Do not assume old application source exists simply because a Codex export describes it.

Run relevant tests and report actual results. Never commit credentials, uploaded reports, student answers, or `.env` files. Use server-side secrets. Get approval before deployment, billing or destructive changes.

At each milestone report changed files, tests, remote commit SHA, PR, risks, and next step. A checkpoint counts as durable only after verifying the commit on GitHub.
