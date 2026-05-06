# `attach`

Attach related rows to the current model through a many-to-many relationship. Inserts rows into the **pivot table** linking the parent and child. Available on `BelongsToMany` and morph-many relations.

## Signature

```ts
relation.attach(
  ids: any | any[] | Model | Model[] | Record<string, any>,
  attributes?: Record<string, any>,
  touch?: boolean,
): Promise<void>
```

## Parameters

| Name         | Required | Description |
| ------------ | -------- | ----------- |
| `ids`        | ✓        | The related row(s) to attach. Accepts a single id, an array of ids, a `Model` instance, an array of models, or a map of `{ id: pivotAttributes }`. |
| `attributes` | optional | Extra columns to write on the pivot row (e.g. `role`, `created_at`, `priority`). Applied to every attached row when `ids` is a flat array. |
| `touch`      | optional | When `true` (default), bumps `updated_at` on the parent. Pass `false` to skip. |

## Real-World Use Cases

### 1. Attach by id

```ts
const post = await Post.createQuery().find(1);
await post.NewRelation('tags').attach(5);
// Inserts (post_id=1, tag_id=5) into post_tag.
```

### 2. Attach multiple ids

```ts
await post.NewRelation('tags').attach([5, 7, 9]);
```

### 3. Attach with extra pivot columns

```ts
await user.NewRelation('roles').attach(adminRoleId, {
  granted_at: new Date(),
  granted_by: req.user.id,
});
```

The pivot inserts include `granted_at` and `granted_by`.

### 4. Attach a model instance directly

```ts
const tag = await Tag.createQuery().firstOrCreate({ slug: 'typescript' });
await post.NewRelation('tags').attach(tag);
```

### 5. Different pivot data per row

Pass a `{ id: pivotAttrs }` map:

```ts
await user.NewRelation('friends').attach({
  2: { friend_level_id: 1 },  // acquaintance
  3: { friend_level_id: 2 },  // friend
  4: { friend_level_id: 3 },  // bff
});
```

### 6. Inside a transaction

```ts
await db().transaction(async (tx) => {
  const post = await Post.createQuery(tx).create({ title: 'Hello' });
  await post.NewRelation('tags').attach([1, 2, 3]);
});
```

When you fetched the parent on `tx`, fedaco threads the connection through to the pivot insert automatically.

### 7. Don't bump parent timestamps

```ts
await user.NewRelation('roles').attach(adminRoleId, {}, /* touch */ false);
```

## Related Pivot Operations

| Method     | Effect |
| ---------- | ------ |
| `attach`   | Insert pivot rows. Doesn't deduplicate — calling twice creates two rows. |
| `detach`   | Delete pivot rows. With no args, removes all related; otherwise filtered by id. |
| `sync`     | Set the related rows to *exactly* the given list — inserts missing, removes extras. Returns the diff. |
| `syncWithoutDetaching` | Like `sync` but never deletes — additive only. |
| `toggle`   | Attach if not present, detach if present. |
| `updateExistingPivot` | Update extra pivot columns for an already-attached row. |

```ts
// Make this user have exactly these roles, removing any others.
const diff = await user.NewRelation('roles').sync([1, 2, 3]);
// diff: { attached: [...], detached: [...], updated: [...] }

await user.NewRelation('roles').toggle(adminRoleId);
// Toggles membership without you needing to check first.
```

## Common Pitfalls

- **`attach` doesn't deduplicate.** Two calls with the same id create two pivot rows. Use `sync` or a unique index on the pivot if duplicates are wrong.
- **Order matters in `sync` return value.** `attached` is the ids that were newly inserted; `detached` is what got removed.
- **For polymorphic pivots**, the relation method handles the `*_type` column — you only pass the related id.
- **Pivot timestamps**: set `withTimestamps()` on the relation definition for `created_at` / `updated_at` to be populated by `attach`.

## See Also

- `detach` — remove pivot rows.
- `sync` — set the relation to an exact list.
- `toggle` — flip membership.
- [Many-to-Many Relationships](../relationships/many-to-many-relationship/relation-many-to-many).
