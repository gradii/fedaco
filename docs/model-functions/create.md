# `create`

Insert a new row and return the hydrated model in one call. The model's `_exists` flag is set to `true` and `_wasRecentlyCreated` to `true` after insert.

## Signature

```ts
FedacoBuilder<T>.create(attributes?: Record<string, any>): Promise<T>
```

## Parameters

| Name         | Required | Description |
| ------------ | -------- | ----------- |
| `attributes` | optional | Object whose keys must be in the model's `_fillable` whitelist. Pass `{}` to insert with defaults only. |

Mass-assignment protection: only attributes listed in `_fillable` (or unguarded with `Model.unguarded(...)`) are written. Everything else throws a `MassAssignmentException`. Use [`forceCreate`](./forceCreate) to bypass.

## Returns

A `Promise<T>` resolving to the saved model. The auto-generated primary key (when `_incrementing` is `true`) is populated.

## Real-World Use Cases

### 1. Create with required fields

```ts
const user = await User.createQuery().create({
  name: 'Ada Lovelace',
  email: 'ada@example.com',
});

console.log(user.id);                  // e.g. 42
console.log(user._wasRecentlyCreated); // true
```

### 2. Create inside a transaction

```ts
await db().transaction(async (tx) => {
  const order = await Order.createQuery(tx).create({
    user_id: 1,
    total: 99,
  });

  await OrderItem.createQuery(tx).create({
    order_id: order.id,
    sku: 'SKU-001',
    quantity: 1,
  });
});
```

### 3. Non-incrementing primary key

For models with `_incrementing = false` (UUIDs, composite keys), pass the key explicitly:

```ts
@Table({ tableName: 'tenants' })
class Tenant extends Model {
  _incrementing = false;
  _keyType = 'string';
  _fillable = ['id', 'name'];

  @PrimaryColumn() declare id: string;
  @Column() declare name: string;
}

await Tenant.createQuery().create({
  id: crypto.randomUUID(),
  name: 'Acme',
});
```

When `create({})` is called on a non-incrementing model with no fillable defaults, the row may not be persisted (`_wasRecentlyCreated` remains `false`). Always pass at least the key for non-incrementing models.

### 4. Create through a relation

`create` on a relation-scoped builder automatically populates the foreign key:

```ts
const user = await User.createQuery().find(1);

const post = await user.NewRelation('posts').create({
  title: 'First Post',
  body: 'Hello world',
});
// post.user_id === 1, set automatically by the HasMany relation
```

## Common Pitfalls

- **`MassAssignmentException`**: the column isn't in `_fillable`. Either add it or use [`forceCreate`](./forceCreate).
- **Timestamps**: if the model uses `@CreatedAtColumn` / `@UpdatedAtColumn`, those are populated automatically — don't pass them in `attributes`.
- **Bulk inserts**: `create` is per-row. For many rows, use [`insert`](./insert) (skips events and hydration) or loop over `create`.

## See Also

- [`createQuery`](./createQuery) — get the builder you call `create` on.
- [`forceCreate`](./forceCreate) — bypass mass-assignment guards.
- [`firstOrCreate`](./firstOrCreate) — find or insert in one call.
- [`updateOrCreate`](./updateOrCreate) — upsert by attributes.
- [`save`](./save) — persist a model instance you've already constructed.
- [`insert`](./insert) — bulk insert without hydration.
