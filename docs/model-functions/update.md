# `update`

Update model rows. There are two distinct callers:

- **Builder** — `Builder.update(values)` runs `UPDATE ... WHERE ...` against rows matched by the query. No model events fire.
- **Instance** — `model.Update(attributes, options?)` fills attributes on the instance and calls `save()`. Model events fire normally.

## Signatures

```ts
// Builder form
FedacoBuilder<T>.update(values: Record<string, any>): Promise<number>

// Instance form
model.Update(attributes?: Record<string, any>, options?: { touch?: boolean }): Promise<boolean>
```

## Parameters

| Name              | Required | Description |
| ----------------- | -------- | ----------- |
| `values`          | ✓ (builder)   | Object of column → new value. Only keys in `_fillable` are honoured. |
| `attributes`      | optional (instance) | Same shape as `values`. Empty `{}` is allowed when you've set fields directly. |
| `options.touch`   | optional | Forwarded to [`save`](./save). |

## Returns

- **Builder**: `Promise<number>` — number of affected rows.
- **Instance**: `Promise<boolean>` — `true` when persisted, `false` when an event handler aborted, `false` when the model didn't yet `_exists`.

## Real-World Use Cases

### 1. Bulk update via the builder

```ts
const affected = await User.createQuery()
  .where('active', false)
  .where('last_login_at', '<', oneYearAgo)
  .update({ archived: true });

console.log(`archived ${affected} rows`);
```

This sends a single `UPDATE` statement — no rows are loaded into memory, no events fire.

### 2. Update one row through the model

```ts
const user = await User.createQuery().find(42);
await user.Update({ email: 'new@example.com' });
```

Only the dirty columns are sent. `updated_at` is bumped automatically when the model uses `@UpdatedAtColumn`.

### 3. Update with timestamps

```ts
await Post.createQuery()
  .where('user_id', userId)
  .update({ pinned: true });
```

When the model uses timestamps, the builder form **automatically appends `updated_at`** to the SET clause via `_addUpdatedAtColumn`. You don't have to pass it.

### 4. Update inside a transaction

```ts
await db().transaction(async (tx) => {
  await User.createQuery(tx)
    .where('id', userId)
    .update({ balance: db().raw('balance - 10') });
});
```

Use `db().raw(...)` for expressions that reference existing column values atomically.

### 5. JSON path update

For models with JSON columns whose `_fillable` declares JSON paths:

```ts
@Table({ tableName: 'configs' })
class Config extends Model {
  _fillable = ['settings', 'settings->theme', 'settings->locale'];

  @JsonColumn() declare settings: any;
}

const cfg = await Config.createQuery().create({ settings: { theme: 'light' } });
await cfg.Update({ 'settings->theme': 'dark' });
// cfg.settings === { theme: 'dark' }
```

### 6. Conditional bulk update

```ts
const refundCount = await Order.createQuery()
  .where('status', 'pending')
  .where('created_at', '<', cutoff)
  .update({ status: 'refunded', refunded_at: new Date() });
```

## Common Pitfalls

- **`MassAssignmentException`**: `values` keys must be in `_fillable`. Add the column or use a direct assignment + `save()`:
  ```ts
  user.guardedField = 'value';
  await user.save();
  ```
- **Builder updates don't fire model events.** No `updating` / `updated` callbacks, no soft-delete check on individual rows. Use the instance form when you need the lifecycle.
- **`update({})` on the instance with `_exists === false`** returns `false` instead of inserting. Use [`save`](./save) or [`create`](./create) for inserts.

## See Also

- [`save`](./save) — persist instance state, INSERT or UPDATE.
- [`create`](./create) — insert and hydrate.
- [`updateOrCreate`](./updateOrCreate) — upsert by attribute set.
- [`increment`](./count) / decrement — atomic numeric bumps via the builder.
- [Transactions Guide](../database/transactions)
