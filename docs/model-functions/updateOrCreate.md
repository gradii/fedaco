# `updateOrCreate`

Find the first row matching `attributes`. If found, update it with `values`. If not, INSERT `{ ...attributes, ...values }`. This is the user-space upsert.

## Signature

```ts
FedacoBuilder<T>.updateOrCreate(
  attributes: Record<string, any>,
  values: Record<string, any>,
): Promise<T>
```

## Parameters

| Name         | Required | Description |
| ------------ | -------- | ----------- |
| `attributes` | ✓        | Used in the WHERE clause and as the lookup key. Always written to the row. |
| `values`     | ✓        | Updated onto the matched row, or merged into the INSERT for the create path. |

## Returns

A `Promise<T>` resolving to the persisted model — either the updated existing row or the freshly inserted one. Check `_wasRecentlyCreated` to distinguish:

```ts
const user = await User.createQuery().updateOrCreate({ email: 'a@x.com' }, { name: 'A' });
if (user._wasRecentlyCreated) {
  // INSERT path
} else {
  // UPDATE path
}
```

## Real-World Use Cases

### 1. Idempotent webhook handler

```ts
async function syncFromStripeEvent(event: StripeEvent) {
  await Customer.createQuery().updateOrCreate(
    { stripe_id: event.customer.id },
    {
      email: event.customer.email,
      plan: event.customer.subscription?.plan ?? 'free',
      synced_at: new Date(),
    },
  );
}
```

Receiving the same webhook twice produces the same final row — second call updates instead of erroring.

### 2. Daily metrics roll-up

```ts
await DailyRevenue.createQuery().updateOrCreate(
  { day: today },
  { cents: totalCentsForDay },
);
```

Schedule it nightly without worrying whether the row already exists.

### 3. Cross-connection upsert

```ts
await User.useConnection('second').updateOrCreate(
  { email: 'admin@example.com' },
  { role: 'admin', active: true },
);
```

### 4. Inside a transaction

```ts
await db().transaction(async (tx) => {
  const tag = await Tag.createQuery(tx).updateOrCreate(
    { slug },
    { name, last_used_at: new Date() },
  );
  await Post.createQuery(tx).create({ primary_tag_id: tag.id, ... });
});
```

### 5. Bulk version with limited concurrency

`updateOrCreate` is per-row. For many records, batch them carefully — concurrent calls on the same key race:

```ts
for (const item of records) {
  await Stat.createQuery().updateOrCreate({ key: item.key }, { value: item.value });
}
```

For real bulk upsert without N round trips, see [`upsert`](./pluck) on the query builder, which compiles to driver-native `INSERT ... ON CONFLICT` / `ON DUPLICATE KEY UPDATE`.

## `updateOrCreate` vs `firstOrCreate` vs `upsert`

| Tool | Lookup hit → | Lookup miss → | Round trips |
| ---- | ------------ | ------------- | ----------- |
| [`firstOrCreate`](./firstOrCreate) | return as-is | INSERT | 2 (SELECT + maybe INSERT) |
| [`updateOrCreate`](./updateOrCreate) | UPDATE | INSERT | 2-3 (SELECT + UPDATE/INSERT) |
| `upsert` (builder)                  | Driver-native UPDATE | Driver-native INSERT | 1 |

For a few rows on a critical path, `updateOrCreate` is fine. For thousands, switch to `upsert`.

## Common Pitfalls

- **Race conditions** — two concurrent calls can both miss the lookup and both insert. Add a unique index on the `attributes` columns; on duplicate-key error, retry as an UPDATE.
- **Make `attributes` minimal and unique.** They're the lookup key. Adding non-key columns there means you'll never find existing rows.
- **`values` overrides `attributes`** during INSERT. If you want a column to be set only on insert (immutable lookup key), put it in `attributes` only.

## See Also

- [`firstOrCreate`](./firstOrCreate) — insert if missing, never update.
- [`firstOrNew`](./firstOrNew) — return without persisting.
- [`save`](./save) — manual save after instance mutations.
- [`upsert`](./pluck) — driver-native bulk upsert.
