---
name: project-structure
description: Placement, scaffolding, and layer-boundary rules for this project's Laravel 11+, Inertia, React, and TypeScript codebase. Use whenever the user asks where a file, component, hook, type, action, controller, or enum should live; scaffolds or adds a feature, page, module, or vertical slice; extracts page logic into a hook or JSX into a component; promotes a component to shared; adds an Action class or moves logic out of a controller; or reviews or audits code for layering, import-boundary, or folder-convention violations. Trigger even when the user does not say "structure" (e.g. "this page is too long", "add CRUD for X", "which folder does this go in?"). Not for bug fixes, styling-only changes, or standalone migrations.
---

# Project Structure: Laravel + Inertia React + TypeScript

Rules for where code lives, how features are scaffolded, which layers may import which, and when to extract page logic. The app has one UI surface, so nothing in the tree is partitioned by surface.

**Why the rules exist.** In a gray area, choose the option that keeps all three properties:

1. **Vertical slices by domain.** A change touches one folder per layer.
2. **Downward-only dependencies.** Shared code never breaks when a feature changes.
3. **Business logic in Action classes.** Logic is reusable from controllers, jobs, and commands.

**Hard vs. soft.** Anything labelled _Hard_ is a rule: follow it or use the rule-break response (Template B). Anything written with `~` is a soft heuristic: use judgment, and say so if you deviate.

---

## 1. Choose a mode, then read the listed files

| Mode                                 | Read                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Where does X go?                     | §2 in this file                                                                                                                                        |
| Scaffold a feature, page, or slice   | §2–4 here, plus `references/scaffolding.md`; also `references/action-layer.md` if it writes data; also `references/audit-and-gates.md` (Quality gates) |
| Extract or refactor a page/component | §3–4 here                                                                                                                                              |
| Add or change an Action class        | `references/action-layer.md`                                                                                                                           |
| Audit existing code                  | §3–4 here, `references/action-layer.md`, `references/audit-and-gates.md`                                                                               |

If a request spans modes (e.g. "add a feature and review it"), read the union.

### Steps by mode

**Where does X go?**

1. Find the §2 row whose "Put it here when the file…" column matches.
2. If two rows match, choose the feature-local one. Promote only when a second domain actually needs it (§4).
3. Answer with Template A.

**Scaffold.**

1. Check enforcement status (below).
2. Pick the archetype and follow the pipeline order in `references/scaffolding.md`.
3. Apply §3 and §4 to the frontend files, and `references/action-layer.md` to Actions.
4. Run the Quality gates (run relevant Pest tests; pre-commit hook handles formatting and types). Do not report "done" until tests pass.
5. Reply with Template C.

**Extract or refactor.**

1. Check the page or component against the §4 triggers.
2. Move logic to a hook, JSX to components, columns to `{domain}-columns.tsx`.
3. Re-check §3 imports. Tests cover behavior; pre-commit hook automatically enforces formatting and types.

**Audit.** Follow `references/audit-and-gates.md`. Report only; do not apply fixes unless asked.

---

## Enforcement and exceptions

**ArchTest.** This skill ships `assets/ArchTest.php` (Pest 2+). Install it as `tests/Feature/ArchTest.php`. It must be in `tests/Feature`, not `tests/Unit`, because its frontend checks call `app_path()` / `resource_path()` and need the Laravel app booted.

- If `tests/Feature/ArchTest.php` exists: read it before scaffolding or auditing. If it disagrees with this document, the test wins; report the mismatch so this skill can be updated.
- If it does not exist: say so once and offer to install it (copy the asset). Do not install it unasked. Do not call the rules "enforced" while it is missing.

**When a request breaks a hard rule.** Reply with Template B and wait for confirmation before proceeding.

**When you cannot run commands** (no shell, or not inside Sail): never claim a gate passed. List the gate commands and mark each "not run".

---

## 2. Placement Matrix

Naming: frontend filenames are **lowercase kebab-case**; exported components are `PascalCase`; hooks and functions are `camelCase`; backend classes are `PascalCase`. `{Domain}` is the PascalCase model name on the backend (`Need`, `PlanningVersion`) and singular kebab-case on the frontend (`need`, `planning-version`). `{plural-domain}` is the plural kebab-case form (`needs`, `planning-versions`).

### Backend

| Layer            | Location                                                                | Put it here when the file…                             | Naming and invariants                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controller       | `app/Http/Controllers/{Domain}/`                                        | receives HTTP and returns Inertia, a redirect, or JSON | `final class {Model}Controller extends Controller`. Thin: authorize, call an Action, return. A single-query read may inline its query.                      |
| FormRequest      | `app/Http/Requests/{Domain}/`                                           | validates input                                        | `Store{Model}Request`, `Update{Model}Request`. Every mutating endpoint uses one.                                                                            |
| Resource         | `app/Http/Resources/{Domain}/`                                          | shapes a model for the client                          | `{Model}Resource`, `{Model}Collection`. Applied before data becomes Inertia props or JSON.                                                                  |
| Action           | `app/Actions/{Domain}/`                                                 | writes data or runs business rules                     | `{Verb}{Model}Action`, one public `handle()`. See `references/action-layer.md`. Note: Fortify actions (`app/Actions/Fortify/`) implement Fortify contracts. |
| Model            | `app/Models/`                                                           | represents a table                                     | Singular PascalCase. Reusable query constraints are Eloquent scopes. No repository layer. No manual `__construct`.                                          |
| Enum             | `app/Enums/`                                                            | lists fixed values for a column                        | `{Model}{Attribute}` or semantic name (e.g. `Urgency`, `Impact`, `NeedStatus`), string-backed. Used for casts, validation, and the TS mirror.               |
| Policy           | `app/Policies/`                                                         | decides allowed or denied                              | `final class {Model}Policy`.                                                                                                                                |
| Domain exception | `app/Exceptions/{Domain}/`                                              | signals a business-rule failure                        | `{SemanticReason}Exception`. Mapped to a response by the exception handler or the controller.                                                               |
| Side effects     | `app/Events/{Domain}/`, `app/Listeners/{Domain}/`, `app/Jobs/{Domain}/` | reacts to a state change or calls an external service  | Events for state changes; queued Listeners/Jobs for external services and email. Must be commit-aware (see Action layer).                                   |
| Factory / seeder | `database/factories/`, `database/seeders/`                              | builds test or seed data                               | One factory per model, with a state for each enum value that matters in tests.                                                                              |
| Routes           | `routes/web.php`                                                        | maps URLs                                              | One group per domain. Route names are `{plural-domain}.{action}` and match page component paths.                                                            |
| Tests            | `tests/Feature/{Domain}/`                                               | tests behavior                                         | `{Model}ControllerTest.php`. Architecture rules live in `tests/Feature/ArchTest.php`.                                                                       |

### Frontend

| Layer                         | Location                                                                   | Put it here when the file…                                        | Naming and invariants                                                                                                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inertia page                  | `resources/js/pages/{plural-domain}/`                                      | matches an `Inertia::render('{plural-domain}/{page}')` name       | `{page}.tsx`, 1:1 with the render name. Thin composer. **Hard:** ≤ 100 non-blank lines, imports excluded. `export default function {Domain}{Page}()`. A page with no domain (e.g. an error page) is `pages/{name}.tsx`. |
| Feature root                  | `resources/js/features/{domain}/`                                          | belongs to exactly one domain                                     | `{domain}` is singular kebab-case (`need`, `planning-version`). (Note: existing components may sit under `pages/{domain}/components/`).                                                                                 |
| Feature components            | `…/{domain}/components/`                                                   | is JSX used by one domain                                         | Domain-only presentation.                                                                                                                                                                                               |
| Table columns                 | `…/{domain}/components/`                                                   | defines a TanStack `ColumnDef[]`                                  | `{domain}-columns.tsx`. Never inline in a page or table.                                                                                                                                                                |
| Feature hooks                 | `…/{domain}/hooks/`                                                        | holds page state, Inertia forms, effects, or handlers             | `use-{domain}-{page}.ts`. Never returns JSX.                                                                                                                                                                            |
| Feature types                 | `…/{domain}/types/`                                                        | describes data for one domain                                     | `{domain}.types.ts`. Mirrors Resource shapes. Enums mirror as string-literal unions.                                                                                                                                    |
| Feature utils                 | `…/{domain}/utils/`                                                        | is a pure calculation for one domain                              | Plain TS calculation. No React, no JSX. (Date/time formatting must always use `@/lib/formatters`).                                                                                                                      |
| UI primitives                 | `resources/js/components/ui/`                                              | is a raw primitive (button, input)                                | shadcn primitives, added via CLI. **Read-only per design system rules** (no variant/style edits).                                                                                                                       |
| App forks & shared composites | `resources/js/components/`                                                 | is an app-level primitive fork or composite used across domains   | Examples: `@/components/status-badge`, `page-card`, `confirm-dialog`, `data-table/`. Accepts `className` and forwards via `cn()`. Never imports `features/*`.                                                           |
| Layout                        | `resources/js/layouts/`                                                    | is app shell, navigation, or layout wrapper                       | Examples: `app-layout.tsx`, `auth-layout.tsx`.                                                                                                                                                                          |
| Global types                  | `resources/js/types/`                                                      | is a cross-domain contract                                        | Paginator, authenticated user, flash messages, shared Inertia props (the shape from `HandleInertiaRequests::share()`).                                                                                                  |
| Common hooks                  | `resources/js/hooks/`                                                      | is a headless hook used by 2+ domains                             |                                                                                                                                                                                                                         |
| Client state                  | `resources/js/stores/`                                                     | is ephemeral UI-only state (wizard, global drawer)                | Never duplicates server props.                                                                                                                                                                                          |
| Library & formatters          | `resources/js/lib/`                                                        | is a helper such as `cn`, or date formatter in `@/lib/formatters` | Always format dates/times with `@/lib/formatters` (`Asia/Makassar`).                                                                                                                                                    |
| Wayfinder output              | `resources/js/actions/`, `resources/js/routes/`, `resources/js/wayfinder/` | is generated                                                      | Never edit. The frontend `@/actions` folder belongs to Wayfinder and is unrelated to PHP `app/Actions`.                                                                                                                 |

---

## 3. Import Rules (single source of truth)

Dependencies point downward:

`pages → features → components → layouts → hooks, lib, types, stores, generated code`

**Common layers** are importable from any feature: `@/components/ui`, `@/components`, `@/layouts`, `@/hooks`, `@/lib`, `@/types`, `@/stores`, and generated code (`@/actions`, `@/routes`, `@/wayfinder`).

1. **Bottom-up (Hard).** `components/*`, `layouts/*`, `hooks/*`, `lib/*`, `types/*`, and `stores/*` never import from `features/*`. Reason: a common module that depends on one feature breaks when that feature changes.
2. **Cross-feature (Hard).** A feature may import **types only** from a sibling feature, using the full file path and the top-level `import type { … }` form: `import type { User } from '@/features/user/types/user.types'`. Do not use inline `{ type User }` specifiers; the audit commands cannot tell them apart from runtime imports. Never import runtime code (components, hooks, utils) from a sibling. When two features need the same runtime code, promote it (§4).
3. **Pages (Hard).** A page imports from its own feature and from common layers. It does not pull runtime code from a second feature.
4. **Generated code.** `@/actions`, `@/routes`, and `@/wayfinder` may be imported from anywhere.

Without the ArchTest, these rules are checked only by review and the audit commands in `references/audit-and-gates.md`.

---

## 4. Extraction and Promotion

### Thresholds

| Limit                     | Value                                   | Kind | Why                                                                                         |
| ------------------------- | --------------------------------------- | ---- | ------------------------------------------------------------------------------------------- |
| Page composer length      | ≤ 100 non-blank lines, imports excluded | Hard | A longer page is almost always holding logic or markup that belongs in a hook or component. |
| Page needs a hook         | Any trigger listed below                | Hard | Keeps pages declarative and logic testable.                                                 |
| `.map()` callback in JSX  | ~10 lines, or any conditional branch    | Soft | Beyond this the item is a component.                                                        |
| One JSX section           | ~40 lines                               | Soft | Readability.                                                                                |
| Feature component or hook | ~150 lines                              | Soft | Split by responsibility past this.                                                          |

### Page logic → hook

Create `features/{domain}/hooks/use-{domain}-{page}.ts` when the page contains **any** of:

- `useState` or `useReducer`
- `useForm`, `router.visit`, `router.post`, or another manual visit
- `useEffect`
- two or more functions declared in the page body that respond to user events

The hook returns one object grouping `state`, `handlers`, and `form`. A page with none of these triggers needs no hook.

### JSX → component

Extract JSX into its own file when **any** of these applies:

1. A `.map()` callback exceeds ~10 lines of JSX or contains conditional branches.
2. It is a distinct visual boundary: card, sidebar, modal content, or filter section.
3. A section exceeds ~40 lines of JSX.
4. The markup needs its own state or lifecycle.
5. It is a `ColumnDef[]` (always goes to `{domain}-columns.tsx`).

Do not over-extract: a single-use fragment of ≤ 10 lines with no state stays inline.

### Promotion

- Used by 1 domain: it stays in `features/{domain}/`.
- Used by 2+ domains: move components to `components/`, hooks to `hooks/`, lib/formatters to `lib/`, types to `types/`.
- Do not pre-promote. Promote only when a second domain actually needs it.
- When promoting a component, first remove its dependencies on feature-local hooks, types, and utils and replace them with props or generics. Reason: common code cannot import `features/*`.

---

## Reply templates

**Template A: placement answer**

```
Path: <full path>
Rule: <§ and row name> — <one-sentence reason>
Imports allowed from: <same feature + common layers, or backend equivalent>
Promote when: <condition, or "n/a">
```

**Template B: rule-break response** (one message, then wait)

```
That would break "<rule>" because <reason in one sentence>.
Compliant alternative: <one line>.
Reply "proceed as asked" if you still want the original approach.
```

**Template C: scaffold summary**

```
Slice: <archetype> for <domain>
Created: <files, grouped by pipeline step>
Gates: ArchTest <pass|fail|not installed|not run> · Tests <pass|fail|not run> (pre-commit enforces formatting and types)
Open items: <deviations from the rules, or "none">
```
