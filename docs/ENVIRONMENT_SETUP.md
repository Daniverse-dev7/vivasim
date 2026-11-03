# Cloud and cross-laptop recovery

1. Sign into the same ChatGPT workspace and connected GitHub account on any laptop.
2. Open https://chatgpt.com/codex and select `Daniverse-dev7/vivasim`.
3. Select a **published** Codex Cloud environment or create and publish it manually.
4. Start a new task from a *pushed* branch, inspect `git status` and latest commit, and read `AGENTS.md` and checkpoints.
5. Run the project's setup and verification commands after its app source is recovered and dependencies are pinned.
6. Before switching devices, commit, push, verify remote SHA and write the next-action checkpoint.

A task's uncommitted workspace changes are not automatically portable. Do not reset or overwrite an old workspace when recovering it. Cloud environment publication and secrets configuration must be verified in Codex UI.
