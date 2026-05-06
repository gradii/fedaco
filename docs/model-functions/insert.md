# `insert`

Bulk-insert raw rows. Faster than [`create`](./create) for large batches because it skips model events, attribute casts, and hydration. The opposite trade-off too — you don't get back hydrated models.

## Signature

```ts
QueryBuilder.insert(values: any[] | Record<string, any>): Promise<boolean>
```

Returns `true` once the INSERT has executed. Wrap in a transaction if you need atomicity across multiple inserts.

## Real-World Use Cases

### 1. Many rows in one statement

```ts
await db().query().from('users').insert([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob',   email: 'bob@example.com' },
  { name: 'Carol', email: 'carol@example.com' },
]);
```

Compiles to a single multi-row INSERT — one round trip.

### 2. Off the model

```ts
// Dispatched from a model — same multi-row insert, scoped to the model's connection.
await User.createQuery().insert([
  { id: 1, email: 'a@x.com' },
  { id: 2, email: 'b@x.com' },
]);
```

### 3. Insert + retrieve last id — `insertGetId`

When you need the auto-generated key:

```ts
const id = await db().query().from('orders').insertGetId({
  user_id: 1,
  total: 99,
});
```

The second arg is the sequence column name (default `id`) — needed for some drivers like PostgreSQL where `currval()` is sequence-scoped.

### 4. Insert ignoring duplicates — `insertOrIgnore`

```ts
const inserted = await db().query().from('subscribers').insertOrIgnore([
  { email: 'a@x.com' },
  { email: 'b@x.com' },
]);
```

Returns the number of rows actually inserted. Driver-native: `INSERT IGNORE` (MySQL), `ON CONFLICT DO NOTHING` (Postgres), etc.

### 5. Driver-native upsert — `upsert`

```ts
await db().query().from('daily_revenue').upsert(
  [
    { day: '2026-05-01', cents: 100 },
    { day: '2026-05-02', cents: 250 },
  ],
  ['day'],          // conflict columns
  ['cents'],        // columns to update on conflict
);
```

Compiles to `INSERT ... ON DUPLICATE KEY UPDATE` (MySQL), `INSERT ... ON CONFLICT (...) DO UPDATE` (Postgres).

For per-row "find then upsert" with model events, use [`updateOrCreate`](./updateOrCreate).

### 6. Insert from a subquery — `insertUsing`

```ts
await db().query().from('archived_orders').insertUsing(
  ['id', 'total', 'archived_at'],
  (q) => q.from('orders').where('completed', true).select('id', 'total', db().raw('NOW()')),
);
```

Atomic copy from one table to another, no rows hydrated.

## `insert` vs `create`

| Tool              | Hydrates result? | Fires model events? | Casts/accessors? |
| ----------------- | ---------------- | ------------------- | ---------------- |
| `create`          | ✓                | ✓ (creating/created/saved) | ✓ |
| `insert`          | ✗ (boolean)      | ✗                   | ✗ — values written verbatim |
| `insertGetId`     | ✗ (returns id)   | ✗                   | ✗ |

Pick `insert` when you've got pre-validated data and you don't need the model API on the result.

## Common Pitfalls

- **No casts**: a `JsonColumn` column needs you to `JSON.stringify` the value yourself.
- **No `created_at` / `updated_at` magic**: the bulk path doesn't auto-fill timestamps. Add them to each row in the array.
- **Watch the array shape**: passing a *single* object inserts one row; passing an *array* inserts many. Mixing the two (e.g. forgetting to wrap) is the easiest typo.

## See Also

- [`create`](./create) — single-row insert with hydration.
- [`updateOrCreate`](./updateOrCreate) — per-row upsert with model events.
- [`upsert`](./pluck) (query builder) — driver-native bulk upsert.
