# Scaffolding a Vertical Slice

## Contents

- Choose an archetype
- Pipeline order
- Canonical reference slice

## Choose an archetype

Deliver every change as a complete slice. Pick the archetype that matches the request; if it spans two, deliver both in pipeline order.

```
1. Page / Read Slice
   Backend:  Controller action + Resource + Route
   Frontend: Feature types + components/hooks + Inertia page
   Test:     Feature test asserting route response, component path, prop shape

2. Mutating Action Slice
   Backend:  Controller action + FormRequest + Action + Route + Redirect/Flash
   Frontend: Hook form handler (or dialog/button component)
   Test:     Feature test asserting authorization, validation errors, DB mutation, redirect

3. Data / API Query Slice
   Backend:  Controller action + FormRequest (filters) + Resource/Collection + Route
             (+ List{Models}Action only if the query exceeds scopes)
   Frontend: Feature type contract update
   Test:     Feature test asserting JSON structure and filters
```

## Pipeline order

Run steps in dependency order. Skip a step only if the feature does not need it (for example, no side effects means skip step 7).

```
 1. Enums                   Statuses, roles, types (e.g. Urgency, Impact, NeedStatus)
 2. Migration               Table and schema
 3. Model & Factory         Relations, scopes, casts, factory states (seeder if needed)
 4. Policy                  view, create, update, delete rules
 5. Exceptions              Domain failure classes (e.g. NeedLockedException)
 6. FormRequests & Resource Store/Update (and filter) requests, Resource transformation
 7. Events/Listeners/Jobs   Only if the feature has side effects (commit-aware)
 8. Actions                 Business operations, transactions, event dispatch
 9. Controller & Routes     Thin intake, `{plural-domain}.{action}` route names
10. Wayfinder generation    vendor/bin/sail artisan wayfinder:generate
11. Feature types           features/{domain}/types/{domain}.types.ts (incl. enum unions)
12. Hooks, UI, columns      use-{domain}-{page}.ts, components, {domain}-columns.tsx
13. Inertia page            pages/{plural-domain}/{page}.tsx (thin composer)
14. Feature tests           Pest tests for the route round-trip and contracts
```

Step 10 must run after step 9 and before step 11, because the frontend imports the generated route and action helpers.
Note: For date/time formatting, always use `@/lib/formatters` (`Asia/Makassar` / WITA timezone per project guidelines).

## Canonical reference slice: Need

Use this tree as the model for names and locations.

```
app/
├── Enums/NeedStatus.php
├── Models/Need.php
├── Policies/NeedPolicy.php
├── Exceptions/Need/NeedLockedException.php
├── Events/Need/NeedCreated.php
├── Actions/Need/
│   ├── CreateNeedAction.php
│   └── UpdateNeedAction.php   ← throws NeedLockedException
└── Http/
    ├── Controllers/Need/NeedController.php
    ├── Requests/Need/
    │   ├── StoreNeedRequest.php
    │   └── UpdateNeedRequest.php
    └── Resources/Need/NeedResource.php

database/
├── migrations/…_create_needs_table.php
└── factories/NeedFactory.php

routes/web.php                                ← needs.* group

resources/js/
├── features/need/
│   ├── components/
│   │   ├── need-columns.tsx
│   │   ├── need-status-badge.tsx
│   │   └── create-need-dialog.tsx
│   ├── hooks/use-need-index.ts
│   ├── types/need.types.ts
│   └── utils/need-calculation.ts
└── pages/needs/
    ├── index.tsx        ← thin composer calling useNeedIndex()
    └── show.tsx

tests/Feature/Need/NeedControllerTest.php
```
