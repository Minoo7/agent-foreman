---
name: Clean OpenCode integration
overview: Refactor the current codebase to remove ad-hoc debugging/hardcoding and leave a clean, minimal OpenCode-backed agent implementation, plus provide a ready-to-paste prompt for a fresh session to execute the cleanup consistently.
todos:
  - id: cleanup-opencode-agent
    content: Refactor `src/agents.ts` to remove hardcoded defaults and ensure opencode uses positional prompt with optional env-driven flags (no default model).
    status: pending
  - id: remove-debug-artifacts
    content: Remove temporary/debug files and sample project dirs; update `.gitignore` to prevent reintroduction.
    status: pending
    dependencies:
      - cleanup-opencode-agent
  - id: docs-opencode-clean
    content: Update OpenCode docs/plugin notes to match the cleaned behavior and env var configuration.
    status: pending
    dependencies:
      - cleanup-opencode-agent
  - id: tests-opencode-regression
    content: Update/add unit tests covering opencode prompt passing and env override behavior; ensure suite passes.
    status: pending
    dependencies:
      - cleanup-opencode-agent
  - id: manual-smoke-init
    content: "Manual smoke test: run init in a fresh sample directory with `AGENT_FOREMAN_AGENTS=opencode` and confirm `ai/` artifacts."
    status: pending
    dependencies:
      - cleanup-opencode-agent
      - tests-opencode-regression
---

# Clean OpenCode-First Refactor Plan

## Goals

- End up with a **clean, minimal** OpenCode-compatible fork where `AGENT_FOREMAN_AGENTS=opencode` works reliably.
- Remove “debugging era” artifacts: hardcoded paths/models, stray scripts, sample projects, noisy logs.
- Keep behavior equivalent to a “fresh, first-try” implementation.
- **Do not hardcode a default model in code** (your preference); model selection stays in OpenCode config / env.

## Guardrails

- No behavior changes outside OpenCode integration unless they’re clearly bug fixes.
- Prefer small, mechanical refactors over rewrites.
- Maintain test coverage; update tests to match the cleaned behavior.

## Implementation Steps

### 1) Establish the clean target behavior (OpenCode)

- Ensure `opencode` agent execution is:
- **Prompt passed as positional message** (not stdin, not `@file` argv).
- Uses `--format default`.
- Uses a deterministic `--agent` (e.g. `summary`) but keep it configurable via env (no hardcoded model).
- Keep agent priority controlled solely by `AGENT_FOREMAN_AGENTS` (already supported via [`src/timeout-config.ts`](/Users/minoo/projects/coding/others/agent-foreman-port/agent-foreman-skill-convert-opencode/src/timeout-config.ts)).

### 2) Clean up OpenCode agent implementation

- Refactor [`src/agents.ts`](/Users/minoo/projects/coding/others/agent-foreman-port/agent-foreman-skill-convert-opencode/src/agents.ts):
- Remove any hardcoded model defaults.
- Keep only:
                - `OPENCODE_AGENT` / `AGENT_FOREMAN_OPENCODE_AGENT` (optional)
                - `OPENCODE_MODEL` / `AGENT_FOREMAN_OPENCODE_MODEL` (optional; used only if provided)
- Ensure `callAgent(...)` uses the correct prompt path for opencode (positional arg).
- Keep debug logging behind `DEBUG=agent-foreman:agents`.

### 3) Remove repo clutter introduced by iterative debugging

- Delete/clean up:
- Temporary files like `prompt.txt` if it’s not part of the product.
- Sample projects created for manual verification (e.g. `_af-sample-*`) from the repo.
- Add patterns to `.gitignore` if needed so these don’t come back.

### 4) Make the OpenCode plugin and docs match the clean behavior

- Ensure [`plugins/agent-foreman/opencode-plugin.js`](/Users/minoo/projects/coding/others/agent-foreman-port/agent-foreman-skill-convert-opencode/plugins/agent-foreman/opencode-plugin.js) and [`plugins/agent-foreman/README_OPENCODE.md`](/Users/minoo/projects/coding/others/agent-foreman-port/agent-foreman-skill-convert-opencode/plugins/agent-foreman/README_OPENCODE.md):
- Explain **exactly** how to run with OpenCode.
- Provide recommended env vars (agent/model) but keep them optional.
- Clarify that `opencode run` prompt is **not stdin**.

### 5) Update tests + add one focused regression

- Update [`tests/agents.test.ts`](/Users/minoo/projects/coding/others/agent-foreman-port/agent-foreman-skill-convert-opencode/tests/agents.test.ts) to verify:
- opencode agent is configured to pass prompt as positional arg.
- no default model is injected when env vars are absent.
- Add a small unit test covering env override behavior (agent/model flags included only when env vars are set).

### 6) Verification checklist (local)

- `npm test` (or `CI=true npm test`).
- In a fresh directory:
- `source ~/.zshrc`
- `AGENT_FOREMAN_AGENTS=opencode agent-foreman init "build a simple calculator web app"`
- Confirm `ai/feature_list.json`, `ai/capabilities.json`, `ai/init.sh`, `ai/progress.log` appear.

## Deliverable: prompt to paste into a fresh session

```text
You are working in the repo: /Users/minoo/projects/coding/others/agent-foreman-port/agent-foreman-skill-convert-opencode

Goal: produce a clean, minimal OpenCode-first version of this project.

Constraints:
- Do NOT add hardcoded model defaults in code.
- Keep OpenCode selection configurable only via env vars.
- Remove ad-hoc debugging artifacts (temporary files, sample dirs, hardcoded values).
- Keep the implementation small and “as if it worked on the first try”.

Definition of done:
- `AGENT_FOREMAN_AGENTS=opencode agent-foreman init "build a simple calculator web app"` works in a fresh sample project directory after sourcing ~/.zshrc.
- The OpenCode integration passes the prompt as a positional message to `opencode run` (not stdin, not @file argv).
- Tests pass.

Tasks:
1) Audit and clean `src/agents.ts`:
            - Ensure opencode uses: `opencode run --format default` plus optional `--agent` / `--model` only if env vars are set.
            - Ensure opencode prompt is passed as positional arg.
            - Remove any hardcoded model defaults.
2) Remove debugging-era artifacts from the repo (prompt files, sample project dirs) and update `.gitignore` accordingly.
3) Update docs (`plugins/agent-foreman/README_OPENCODE.md`) to document the clean usage and env vars.
4) Update/add tests to prevent regressions (opencode prompt passing + env overrides).
5) Run: `npm run build` and `CI=true npm test`.

When running a manual check, use a fresh directory under /Users/minoo/projects/coding/others/agent-foreman-port/ (outside the repo) and run init there.

Be careful not to commit secrets. Do not add any new credentials to files.



```