# Backend Action Layer

Controllers handle HTTP. Actions handle business rules and writes. One Action = one business operation (`CreateNeedAction`, `UpdateNeedAction`) with a single public `handle()` method.

All new business logic goes in Actions. Do not introduce `app/Services` or repositories. (Fortify actions under `app/Actions/Fortify/` implement Laravel Fortify contracts).

## Contents

- Invariants
- Commit-aware side effects
- Example

## Invariants

1. **HTTP-agnostic.** Accept primitives, arrays (typically `$request->validated()`), or models. Never accept `Request`, `Response`, `JsonResponse`, or `RedirectResponse`. Never call `redirect()` or `Inertia::render()`. `UploadedFile` is allowed for file processing. Reason: an HTTP-aware Action cannot be called from a job or command.
2. **Pass the actor explicitly**: `handle(array $data, User $actor)`. Do not call `auth()` inside an Action. Reason: there is no logged-in user in jobs and commands.
3. **Own the transaction.** Wrap multi-table writes in `DB::transaction()`.
4. **Commit-aware side effects.** Anything dispatched inside a transaction must wait for commit (table below).
5. **Domain exceptions.** Throw a specific exception (`throw new NeedLockedException()`). The exception handler or controller maps it to a response.
6. **Stateless.** Hold no request-specific state on the instance. Constructor-injected dependencies are fine.
7. **Composition.** An Action may call other Actions. Keep the call graph acyclic. Split an Action that grows into several unrelated operations.
8. **Not `final`.** Controllers and policies are `final`; Actions are not, so tests can mock them (Mockery cannot mock final classes).
9. **Reads.** Prefer scopes plus FormRequest filters in the controller. Create a `List{Models}Action` only when a read needs multi-step composition beyond scopes.

## Commit-aware side effects

| Dispatching                 | Use                                                                             |
| --------------------------- | ------------------------------------------------------------------------------- |
| Events                      | the event implements `ShouldDispatchAfterCommit`                                |
| Queued listeners            | the listener implements `ShouldHandleEventsAfterCommit`                         |
| Jobs                        | the job implements `ShouldQueueAfterCommit`, or dispatch with `->afterCommit()` |
| Queued mail / notifications | `->afterCommit()`                                                               |
| Anything else               | `DB::afterCommit(fn () => …)`                                                   |

Do not guess an interface name. Confirm it exists in the installed framework before using it:

```bash
grep -rl "ShouldDispatchAfterCommit" vendor/laravel/framework/src/Illuminate
```

If the grep returns nothing, fall back to `DB::afterCommit(...)` and tell the user.

## Example

```php
// Controller: thin
public function store(StoreNeedRequest $request, CreateNeedAction $action): RedirectResponse
{
    $this->authorize('create', Need::class);
    $action->handle($request->validated(), $request->user());

    return to_route('needs.index');
}

// Action: owns the write
public function handle(array $data, User $actor): Need
{
    return DB::transaction(function () use ($data, $actor) {
        $need = Need::create([...$data, 'created_by' => $actor->id]);
        NeedCreated::dispatch($need); // event implements ShouldDispatchAfterCommit

        return $need;
    });
}
```
