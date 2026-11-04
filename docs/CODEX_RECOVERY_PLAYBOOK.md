# Codex Cloud recovery and publishing playbook

## Current verified state (2026-11-04)
- GitHub repo: Daniverse-dev7/vivasim. `main` has engineering docs but no app source or `package.json`.
- A prior Codex onboarding task verified a matching local/remote HEAD (`0433edba841ef797ff32d798fa6eceec2f51a296`) and nine foundation files.
- The user-visible Codex environment settings screen showed an unpublished `vivasim` draft with "Couldn't publish environment. Your settings are saved. Try publishing again."
- Earlier cloud task suffered `proxy:8080` connectivity failures and was deleted; its source has not been recovered. The exported conversation is a specification/history, **not** a source code backup.

## Safest route to publish
1. In Codex Cloud, open Environment > vivasim. Confirm the repository is exactly `Daniverse-dev7/vivasim`.
2. **Copy/save the existing Start skill text externally before editing.** Do not remove the repository or discard the draft.
3. Keep install script unset while no dependency manifest exists. Avoid guessing a package installation command.
4. Click Retry/Publish once. If successful, note the published version and verify a fresh task can read `AGENTS.md`.
5. If publishing fails, record the full error and use the in-product **Report issue** control. Link to GitHub issue #2 as a project record, but the GitHub issue is **not** a platform support request.
6. If allowed, test a *new* environment with the same repository and minimal default start configuration; preserve old environment and draft until this proves successful. Only create duplicate resources when needed.
7. A draft alone does not prove the environment published. Never state it is published until the UI confirms.

## Recover application before rebuilding
- Inspect accessible older cloud tasks, branches, PRs, commits, patches, zip archives and local source on the original laptop.
- Never use `git reset --hard`, `git clean -fd`, force pushes or merge an incomplete replacement over old source.
- If found: create a new recovery branch, copy tracked source (exclude secrets/user data), commit, push, verify remote files, and open a PR. Build/test recovered source before merging.
- If not found: use the saved master product specification to create a fresh implementation plan; treat implementation as a **rebuild**.
- Separately review privacy, AI costs/quotas, upload limits, abuse prevention and multi-tenant access control before launch.

## Standard handoff between laptops
1. Before ending task: check `git status`, run relevant tests, commit and push to a feature branch, verify the GitHub remote SHA, and record the next task.
2. On another laptop: sign in to the same ChatGPT workspace and GitHub installation; open Codex Cloud, select `Daniverse-dev7/vivasim`, choose the correct branch and published environment.
3. Check branch, remote, `git status`, `git log -1`; read AGENTS.md and checkpoints. Never rely on uncommitted prior task files.
4. For any new app dependencies, commit lockfiles and establish a deterministic environment install script. Then run tests in a fresh task.

## Ready-to-use verification prompt
Inspect git status, git remote -v, git log -1, AGENTS.md, package manifests and source tree. Verify GitHub checkout and npm connectivity. Do not change files. Report current branch, remote SHA, source presence, setup results, and publishing status only if verifiable from available tools.
