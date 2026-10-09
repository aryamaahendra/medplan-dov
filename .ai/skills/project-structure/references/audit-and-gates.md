# Audit Procedure and Quality Gates

## Contents

- Audit procedure
- Boundary check commands
- Audit report template
- Quality gates
- When a gate fails

Rule definitions live in SKILL.md §3–4 and `references/action-layer.md`. This file says how to check them; it does not restate them.

## Audit procedure

1. If `tests/Feature/ArchTest.php` exists, run it first: `vendor/bin/sail bin pest tests/Feature/ArchTest.php`. Report each failure as a finding. If it does not exist, use the commands below and offer to install the template (SKILL.md, Enforcement).
2. Run the boundary check commands below. Treat each match as a **candidate** and confirm it by reading the file before reporting.
3. Review by hand what no command can check: Action single-responsibility, route-name parity with page paths, and the §4 extraction thresholds.
4. Report with the template below. Do not apply fixes unless asked.

If you cannot run commands, do the same checks by reading files, and say that the findings come from reading rather than from running.

## Boundary check commands

```bash
# 1. Common layers importing features (SKILL.md §3 rule 1)
grep -rnE "from '@/features" resources/js/components resources/js/layouts resources/js/hooks resources/js/lib resources/js/types resources/js/stores

# 2. Runtime imports from a sibling feature, including multi-line imports (§3 rule 2).
#    Matches are printed as multi-line text; `import type { … }` is correctly ignored.
for d in resources/js/features/*/; do n=$(basename "$d"); grep -rPzo "import (?!type\b)[^;'\"]*?from '@/features/(?!$n/)[^']*'" "$d" | tr '\0' '\n'; done

# 3. Pages that may exceed the length bound (raw count including imports; candidates only)
find resources/js/pages -name '*.tsx' ! -path '*/components/*' -exec wc -l {} + | awk '$2 != "total" && $1 > 100'

# 4. HTTP leakage into Actions (action-layer.md invariants 1 and 2; comments and class names can false-match)
grep -rnE "Request|Response|redirect\(|Inertia::render|auth\(\)" app/Actions
```

Known limits:

- Command 2 flags inline `import { type X } from '@/features/…'`. The convention is `import type { X }`, so a flag there is a convention finding, not a false alarm.
- Command 3 counts imports and blank lines, so the real count is lower. Open each candidate and count non-blank, non-import lines before reporting.
- When the ArchTest is installed, it is authoritative; the commands only supplement it.

## Audit report template

Group findings by severity, in this order. Use this exact line format.

```
## Breaks a layer boundary
- <file>:<line> | <rule (§ or invariant)> | <why it matters> | <fix>

## Violates an invariant
- <file>:<line> | <rule> | <why it matters> | <fix>

## Convention drift
- <file>:<line> | <rule> | <why it matters> | <fix>

Checked with: <ArchTest | commands | reading only>. Not checked: <anything skipped>.
```

If a group has no findings, write "none".

## Quality gates

Run in Sail. Run each gate and record `pass`, `fail`, or `not run`. If you cannot run commands, list them and mark every gate `not run`.

> [!NOTE]
> Per project guidelines (`AGENTS.md`), do **not** manually run lint, formatting, or TypeScript checks during the agent task loop: code formatting (`Prettier`, `Pint`), linting (`ESLint`), and type analysis (`tsc`, `PHPStan`) are enforced automatically by the pre-commit hook.

1. **Route and component parity.** The Pest test asserts the exact component path and prop shape:
    ```php
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('needs/index')
        ->has('needs.data')
        ->has('filters')
    );
    ```
2. **HTTP decoupling.** Audit command 4 returns no confirmed matches in new domain Actions.
3. **Commit-aware side effects.** Every event, listener, job, mail, or notification dispatched inside a transaction follows the table in `references/action-layer.md`.
4. **Import rules.** Audit commands 1 and 2 return no confirmed matches.
5. **Page bound.** Each page composer is ≤ 100 non-blank lines (imports excluded), with stateful logic in `use-{domain}-{page}.ts`.
6. **Naming.** Route names are `{plural-domain}.{action}` and match page component paths.
7. **Automated test gates.**

    | Gate                         | Command                                               |
    | ---------------------------- | ----------------------------------------------------- |
    | ArchTest (only if installed) | `vendor/bin/sail bin pest tests/Feature/ArchTest.php` |
    | Domain feature tests         | `vendor/bin/sail bin pest tests/Feature/{Domain}`     |

## When a gate fails

1. Read the failure output and fix the cause in the smallest change that satisfies the rule.
2. Re-run that gate.
3. When all gates have been run once, re-run the full list one final time, because a fix can break an earlier gate.
4. If the same gate fails three times, stop. Report the gate, the exact command, and the last output to the user instead of continuing.
