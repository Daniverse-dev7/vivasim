# Provider activation and public beta

The implementation is not an activated service. The last inspection found no configured runtime secret bindings or hosting connection. Do not advertise live provider access until real requests succeed.

## Secure configuration

Choose accounts with verified current free-tier terms and no paid fallback/overage. At least two distinct providers must be enabled to demonstrate switching. Add secrets in the runtime/hosting service's secure environment settings, never in chat, git, a NEXT_PUBLIC_ variable or a client bundle.

For each chosen service, set these three variables (see .env.example):

- `VIVASIM_CHAT_<SERVICE>_KEY`
- `VIVASIM_CHAT_<SERVICE>_MODEL`
- `VIVASIM_CHAT_<SERVICE>_FREE_TIER_CONFIRMED=true` only after verifying the current model/account allowance.

SERVICE is GROQ, GEMINI, CEREBRAS, OPENROUTER or HUGGINGFACE. OpenRouter requires a model ID ending in `:free`. No model ID defaults are assumed because models and free allowances change. A free consumer chatbot subscription is not an API credential.

For production AI requests also configure `VIVASIM_BUDGET_REDIS_URL` and `VIVASIM_BUDGET_REDIS_TOKEN` for a free-tier Upstash-compatible Redis REST service. Set `VIVASIM_AI_DAILY_ATTEMPTS` conservatively; it counts provider attempts, not dollars. Disable paid overages in the provider account where possible. Do not enable billing to complete this beta.

## Network access

The runtime must allow the hosts for services actually enabled:

| Service | API host |
| --- | --- |
| Groq | api.groq.com |
| Gemini | generativelanguage.googleapis.com |
| Cerebras | api.cerebras.ai |
| OpenRouter | openrouter.ai |
| Hugging Face | router.huggingface.co |
| Redis REST | Exact hostname of the chosen Redis endpoint |

Network access changes use the environment configuration workflow. Publishing a revised environment and deploying the app are separate actions; neither has been performed. Do not bypass the runtime proxy.

## Verify before promotion

1. Run `npm run check:activation` in the configured server runtime. It prints missing variable names and configuration state, never key values. It does not load .env files automatically and cannot prove valid credentials, free quotas or release readiness.
2. Start the built app with the same environment, verify enabled services at `/api/chat/providers`, then send synthetic content through `/chat` with explicit consent.
3. Verify a multi-turn conversation, switch to a second provider, renew consent and confirm history is preserved. Test quota errors through controlled mocks rather than deliberately exhausting a live free allowance.
4. Verify shared Redis reservation/denial and provider-side spending settings. Complete per-user abuse controls and remaining gates in LAUNCH_PLAN.md.
5. Choose and connect a hosting account, verify its current free allowance and commercial-use terms, complete phone QA and release review. Only then approve a concrete merge/deployment.

Local practice works without provider accounts. Live chat, live-provider accuracy and production hosting remain pending until the above configuration and checks are complete.
