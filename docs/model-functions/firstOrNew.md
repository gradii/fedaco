# `firstOrNew`

Find the first row matching `attributes`. If nothing matches, return a **new, unsaved** instance pre-filled with `{ ...attributes, ...values }`. Caller is responsible for calling `save()` if persistence is wanted.

## Signature

```ts
FedacoBuilder<T>.firstOrNew(
  attributes: Record<string, any>,
  values?: Record<string, any>,
): Promise<T>
```

## Returns

- An existing model when found — `_exists === true`.
- A fresh instance when not found — `_exists === false`. **Not persisted.**

Use the `_exists` flag to branch:

```ts
const user = await User.createQuery().firstOrNew({ email });
if (!user._exists) {
  // populate fields, then save
  user.name = derivedName;
  await user.save();
}
```

## Real-World Use Cases

### 1. Conditional save with extra data

```ts
const user = await User.createQuery().firstOrNew(
  { email: 'ada@example.com' },
  { name: 'Ada Lovelace' },
);

if (!user._exists) {
  user.plan = computeDefaultPlan(req);
  await user.save();
}
```

You only commit the row after a domain check that depends on whether it existed.

### 2. Building forms — pre-fill but don't persist

```ts
async function editForm(req: Request) {
  const user = await User.createQuery().firstOrNew(
    { id: req.params.id },
    { plan: 'free', timezone: req.headers['x-tz'] },
  );
  return render('user-form', { user });
}
```

The page pre-populates from the database when the row exists or from the defaults otherwise — no INSERT happens just by rendering the form.

### 3. Cross-connection lookup

```ts
const user = await User.useConnection('replica')
  .firstOrNew({ email: 'tony.stark@example.com' });
console.log(user._exists, user.GetConnectionName());
```

## `firstOrNew` vs `firstOrCreate` vs `findOrNew`

| Method                       | Lookup         | Lookup miss → | Persists? |
| ---------------------------- | -------------- | ------------- | --------- |
| [`firstOrNew`](./firstOrNew) | by attribute set | new instance | ✗ |
| [`firstOrCreate`](./firstOrCreate) | by attribute set | INSERT        | ✓ |
| [`findOrNew`](./findOrNew)   | by primary key | new instance | ✗ |
| [`findOrFail`](./findOrFail) | by primary key | throws        | n/a |

Pick:

- `firstOrNew` — non-key lookup, manual save.
- `firstOrCreate` — non-key lookup, auto-insert.
- `findOrNew` / `findOrFail` — primary-key lookup.

## Common Pitfalls

- **Returns an instance, not a tuple.** Inspect `_exists` rather than expecting `[user, created]` (other ORMs do that).
- **Forgetting to `save()`** is the most common bug — the new instance is never persisted unless you do.

## See Also

- [`firstOrCreate`](./firstOrCreate) — auto-persist variant.
- [`updateOrCreate`](./updateOrCreate) — upsert.
- [`findOrNew`](./findOrNew) — by primary key.
- [`first`](./first) — the underlying lookup.
