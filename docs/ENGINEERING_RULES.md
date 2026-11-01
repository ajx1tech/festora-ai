# Festora AI Engineering Rules

These rules govern every prompt and contribution in this repository.

1. **NEVER suppress problems**: No `eslint-disable`, `@ts-ignore`, `@ts-nocheck`, `ts-expect-error` without a linked reason, `ignoreBuildErrors`, or `ignoreDuringBuilds`. Always fix root causes.
2. **TypeScript strict**: No `any`. Explicit return types on exported functions. JSDoc with `@param` and `@returns` on every exported function.
3. **Pure logic lives in `lib/engines` and `lib/utils`**: No React, no `fetch`, no `Date.now()` inside (accept a `now` parameter). All money math in integer minor units or rounded with a documented method.
4. **Secrets are server-only**: `GEMINI_API_KEY` must never appear in client code, logs, responses, or the repo.
5. **Safe text rendering**: User text must be rendered as plain text through React. Never use `dangerouslySetInnerHTML`.
6. **Testing and accessibility rigor**: Every new feature ships with tests in the same prompt. Accessibility requirements: semantic landmarks, labelled controls, visible focus, `aria-live` for async status, keyboard operable, AA contrast, and reduced motion respected.
7. **Quality validation and commit discipline**: After each prompt, run `npm run validate`. It must pass with zero errors and zero warnings, then commit locally with a conventional commit message. The human pushes.
8. **Stuck protocol**: If the same error persists after 2 fix attempts, simplify the approach (smaller dependency-free implementation) instead of looping. Report what was simplified.
9. **Keep the repo small**: No images over 200KB, no committed build output, no lockfile churn.
