# `delete`

Remove rows. Like [`update`](./update), `delete` has two callers — a bulk builder form and a per-instance form. Soft-deleting models override the instance form to set `deleted_at` instead of issuing `DELETE`.

## Signatures

```ts
// Builder form — DELETE matched rows
FedacoBuilder<T>.delete(): Promise<number>

// Instance form — delete this row
model.Delete(): Promise<boolean | number | null>

// Force-delete on a soft-delete model — actually issues DELETE
model.ForceDelete(): Promise<boolean | number>
```

## Returns

- **Builder**: `Promise<number>` — affected row count.
- **Instance**: `Promise<true>` on success, `Promise<false>` if a `deleting` event handler aborted, `Promise<null>` if the model didn't `_exists`.
- **`ForceDelete`**: same as `Delete` but always issues real `DELETE` regardless of soft-delete config.

## Real-World Use Cases

### 1. Delete one row

```ts
const user = await User.createQuery().find(42);
if (user) {
  await user.Delete();
}
```

Lifecycle events that fire (in order): `deleting`, `deleted`. Touched-by-relation parents are bumped via `TouchOwners` before the actual delete.

### 2. Bulk delete via the builder

```ts
const removed = await User.createQuery()
  .where('verified', false)
  .where('created_at', '<', sixMonthsAgo)
  .delete();

console.log(`deleted ${removed} unverified users`);
```

The builder form **does not fire model events** — it's a direct `DELETE ... WHERE ...`. Use the instance form when you need `deleting` / `deleted` hooks.

### 3. Inside a transaction

```ts
await db().transaction(async (tx) => {
  const orphans = await Comment.createQuery(tx)
    .whereNotIn('post_id', allowedIds)
    .delete();
  console.log(`deleted ${orphans} orphan comments`);
});
```

### 4. Soft delete vs hard delete

For a model using the `SoftDeletes` mixin:

```ts
@Table({ tableName: 'posts' })
class Post extends mixinSoftDeletes(Model) {
  @DeletedAtColumn() declare deleted_at: Date | null;
}

const post = await Post.createQuery().find(1);

await post.Delete();      // sets deleted_at — soft delete
await post.ForceDelete(); // actual DELETE — bypasses soft-delete
```

Soft-deleted rows are filtered out of the default query. Use `withTrashed()` to include them or `onlyTrashed()` to fetch only the soft-deleted ones.

### 5. Delete via a relation

```ts
const user = await User.createQuery().find(1);
await user.NewRelation('posts').where('draft', true).delete();
```

This deletes only the matching child rows, scoped by the foreign key.

### 6. Cascade-style cleanup

If you don't have database-level `ON DELETE CASCADE`, do it explicitly inside a transaction:

```ts
await db().transaction(async (tx) => {
  const user = await User.createQuery(tx).find(userId);
  if (!user) return;

  await Post.createQuery(tx).where('user_id', userId).delete();
  await Comment.createQuery(tx).where('user_id', userId).delete();
  await user.Delete();
});
```

## Common Pitfalls

- **Calling `Delete()` on an instance with `_exists === false`** resolves to `null`, not an error. Check the result if you need to distinguish.
- **Builder `.delete()` skips events**. Anything that needs to run on row removal (audit logs, cache invalidation) belongs in the `deleting` / `deleted` callbacks and won't fire from a bulk delete.
- **Soft-delete tables**: prefer [`Delete`](./delete) over `ForceDelete` unless you specifically want to bypass the trashed-at column.

## See Also

- [`forceDelete`](./forceDelete) — bypass soft-delete (instance form).
- [`save`](./save) / [`update`](./update) — change rows without removing them.
- [`where`](./where) — build the criteria for bulk delete.
- [Transactions Guide](../database/transactions) — atomic multi-table cleanup.
