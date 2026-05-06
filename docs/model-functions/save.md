# `save`

Persist the current state of a model instance. Performs an INSERT when the model is new (`_exists === false`) and an UPDATE when it already represents a row in the database.

## Signature

```ts
model.save(options?: { touch?: boolean }): Promise<boolean>
```

## Parameters

| Name             | Required | Description |
| ---------------- | -------- | ----------- |
| `options.touch`  | optional | When `true` (default), updates `updated_at` on parent models in `BelongsTo` relationships if the current model is dirty. Pass `false` to skip cascading touches. |

## Returns

`Promise<boolean>` — `true` when the row was written, `false` when a `saving` / `creating` / `updating` event handler short-circuited the save by returning `false`.

## Real-World Use Cases

### 1. Insert a new instance

```ts
const user = User.initAttributes({
  name: 'Ada Lovelace',
  email: 'ada@example.com',
});

await user.save();
console.log(user.id);                  // populated by the DB
console.log(user._wasRecentlyCreated); // true
```

### 2. Update after mutating fields

```ts
const user = await User.createQuery().find(42);
if (!user) throw new Error('not found');

user.email = 'ada.lovelace@example.com';
await user.save();
```

`save()` only sends the dirty columns in the UPDATE — fields you didn't change aren't part of the SQL. If nothing changed and the model isn't new, `save()` is a no-op.

### 3. Save inside a transaction

You don't need to wire the connection through manually as long as `_connection` was set when the instance was loaded:

```ts
await db().transaction(async (tx) => {
  const user = await User.createQuery(tx).find(42);
  user.balance -= 10;
  await user.save(); // runs on `tx` because the model carries the connection name
});
```

### 4. Cross-connection save via `setConnection`

Override the connection on a fresh instance before saving:

```ts
const user = User.initAttributes({ email: 'replica@example.com' });
user.setConnection('replica');
await user.save();
console.log(user.getConnectionName()); // 'replica'
```

### 5. Skip touching parents

```ts
const post = await Post.createQuery().find(1);
post.body = 'edited';

// Don't bump the parent user's updated_at.
await post.save({ touch: false });
```

## Lifecycle Events

`save()` fires these events in order. Returning `false` from any handler aborts the save and `save()` resolves to `false`:

- `saving` — before any database write.
- `creating` (insert path) or `updating` (update path).
- `created` / `updated` — after the row is written, before commit.
- `saved` — last, regardless of insert vs update.

## Common Pitfalls

- **Returns `false`, not `undefined`, on event abort.** Check the boolean if your business logic depends on persistence.
- **Re-saving an existing model when nothing changed** is cheap — fedaco short-circuits in `PerformUpdate` when `getDirty()` is empty.
- **For one-shot insert+return**, prefer [`create`](./create) over `initAttributes` + `save`.

## See Also

- [`saveOrFail`](./saveOrFail) — save inside a transaction and throw if it fails.
- [`create`](./create) — insert and return in a single call.
- [`update`](./update) — update without re-fetching.
- [`fresh`](./fresh) — return a new instance reloaded from the database.
- [`setConnection`](./setConnection) — override the connection before save.
