# First public beta

Goal: a student can prepare a report, rehearse a viva, understand feedback and retain results, with reliable service behavior and clear privacy terms.

## Accepted release constraints

Free limited beta. Use free service tiers only; no paid subscriptions, paid provisioning or automatic paid fallback. Verify current free-tier allowances and overage settings before choosing hosting/AI/Redis services. When quota is exhausted, preserve local practice.

## Scope

Keep report extraction, local drafts, consented AI report review, voice rehearsal/dictation, saved sessions and feedback. Add report-grounded AI questions and evidence-based answer feedback before promoting the product as an AI examiner. Defer accounts, paid subscriptions, cloud synchronization, social features and OCR unless beta feedback makes them essential.

## Release gates

- [x] Report, voice, local-history and heuristic-feedback workflows implemented and covered by automated tests.
- [ ] Report-grounded AI questions and answer review integrated end to end.
- [ ] Real provider evaluation using synthetic reports, including unavailable providers and adversarial report text.
- [ ] Shared production limits verified against a provisioned Redis service; provider-side spending limit configured.
- [ ] Per-user abuse controls and practical burst/concurrency limits verified on chosen hosting.
- [ ] Support contact, provider disclosures, terms and privacy reviewed for actual services.
- [ ] Real Android/iPhone smoke tests and student usability trial.
- [ ] Production hosting, secrets, monitoring, backup/export guidance and rollback verified.
- [ ] Owner approves concrete release and deployment.

## Budget behavior

Production provider attempts require an Upstash-compatible Redis REST budget service. Every retry and fallback reserves one attempt atomically. The global daily cap defaults to 100 attempts per UTC day; configuration errors, exhaustion and service failures block AI calls. Local report checklists remain available. This bounds request count, not dollars: provider spending limits and maximum input/output settings are also required. The existing per-instance concurrency/rate gate is not sufficient as a public abuse-control system.

## External decisions pending

Specific free-tier hosting/AI/Redis accounts, current quota and overage settings, support contact and provider credentials. Budget is zero for paid services; free limited beta is confirmed. Store secrets in environment settings, never in chat or git. No merge, provisioning of paid services, publication or deployment is authorized by this plan alone.
