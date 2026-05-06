# `firstOrCreate`

Find the first row matching `attributes`. If none exists, INSERT one. Combines a SELECT + INSERT in user space — there's no native upsert SQL involved.

## Signature

```ts
FedacoBuilder<T>.firstOrCreate(
  attributes: Record<string, any>,
  values?: Record<string, any>,
): Promise<T>
```

## Parameters

| Name         | Required | Description |
| ------------ | -------- | ----------- |
| `attributes` | ✓        | Used in the WHERE clause. If a row matches, that row is returned. If no row matches, **these become part of the INSERT body**. |
| `values`     | optional | Extra columns merged on top of `attributes` only when inserting. They're not used in the WHERE clause. |

When inserting, the final body is `{ ...attributes, ...values }`.

## Returns

A `Promise<T>` resolving to the existing or newly created model. Inspect `_wasRecentlyCreated` to know which path you got:

```ts
const user = await User.createQuery().firstOrCreate({ email: 'a@x.com' });
if (user._wasRecentlyCreated) {
  await sendWelcomeEmail(user);
}
```

## Real-World Use Cases

### 1. Idempotent signup

```ts
const user = await User.createQuery().firstOrCreate(
  { email: 'ada@example.com' },
  { name: 'Ada Lovelace', plan: 'free' },
);
```

The user is found by `email`. If new, `name` and `plan` are also inserted.

### 2. Tag-style joins

Lookup-or-create when populating relations:

```ts
const tag = await Tag.createQuery().firstOrCreate({ slug: 'typescript' });
await post.NewRelation('tags').attach(tag.id);
```

### 3. Across a non-default connection

```ts
const user = await User.useConnection('second')
  .firstOrCreate({ email: 'tony.stark@example.com' });
console.log(user.getConnectionName()); // 'second'
```

### 4. Inside a transaction

For idempotent writes, wrap the call to make the SELECT + INSERT atomic with the rest of your logic:

```ts
await db().transaction(async (tx) => {
  const tag = await Tag.createQuery(tx).firstOrCreate({ slug: 'typescript' });
  await Post.createQuery(tx).create({ author_id: 1, primary_tag_id: tag.id });
});
```

## `firstOrCreate` vs `firstOrNew` vs `updateOrCreate`

| Method | Lookup miss → ... | Persists? |
| ------ | ----------------- | --------- |
| [`firstOrCreate`](./firstOrCreate) | INSERT `{ ...attributes, ...values }` | ✓ |
| [`firstOrNew`](./firstOrNew)       | Returns a new instance with `{ ...attributes, ...values }` | ✗ — call `save()` yourself |
| [`updateOrCreate`](./updateOrCreate) | INSERT new row | ✓ |
| [`updateOrCreate`](./updateOrCreate) (lookup hit) | UPDATE `values` on the matched row | ✓ |

## Common Pitfalls

- **Race condition on lookup-then-insert.** Two concurrent calls may both see "not found" and both insert. Add a unique index on the lookup column and either retry on conflict or wrap in a transaction with `SERIALIZABLE`.
- **`attributes` is part of the INSERT body too.** Don't put computed query-only conditions there — use a follow-up `where(...)` outside `firstOrCreate`.
- **`values` is ignored on lookup hit.** If you want to update on hit, use [`updateOrCreate`](./updateOrCreate).

## See Also

- [`firstOrNew`](./firstOrNew) — the no-persist variant.
- [`updateOrCreate`](./updateOrCreate) — upsert by attribute set.
- [`findOrFail`](./findOrFail) — error instead of insert when not found.
- [`create`](./create) — unconditional INSERT.
