# `fresh`

Return a **fresh, newly-loaded copy** of the current model from the database, leaving `this` untouched. Use it when other code may have updated the row and you want a snapshot.

## Signature

```ts
model.Fresh(with?: string[] | string): Promise<this | undefined>
```

## Parameters

| Name   | Description |
| ------ | ----------- |
| `with` | Relations to eager-load on the fresh copy. Same shape as [`with`](./with). |

## Returns

- A new model populated from the database, or
- `undefined` if the row no longer exists, or
- `undefined` when called on an instance that doesn't `_exists`.

The original instance is **not** modified — for in-place reload use [`refresh`](./fresh) (`Refresh`).

## Real-World Use Cases

### 1. Snapshot before / after a write

```ts
const before = await User.createQuery().find(1);
await Order.createQuery().create({ user_id: 1, total: 99 });

const after = await before.Fresh();
console.log(before.order_count, '→', after.order_count);
```

### 2. Detect external mutation

```ts
const post = await Post.createQuery().find(postId);
// ... long pause, work, etc.
const latest = await post.Fresh();
if (latest && latest.updated_at > post.updated_at) {
  throw new Error('post was edited by someone else');
}
```

### 3. Reload with relations

```ts
const order = await Order.createQuery().find(1);
const enriched = await order.Fresh(['items', 'customer']);
// enriched.items / enriched.customer populated; original `order` unchanged
```

### 4. Refresh in place — `Refresh`

When you want to mutate the instance you already have:

```ts
const post = await Post.createQuery().find(1);
// ... time passes
await post.Refresh();
// post is now reloaded — same instance, latest data
```

`Refresh` reloads attributes onto `this` and re-fetches all currently-loaded relations.

## `Fresh` vs `Refresh`

| Method  | Returns           | Mutates `this` | Reloads relations? |
| ------- | ----------------- | -------------- | ------------------ |
| `Fresh` | new instance      | ✗              | only when you pass `with` arg |
| `Refresh` | `this`          | ✓              | reloads currently-loaded relations |

Use `Fresh` when you want to keep the old state for comparison. Use `Refresh` when you simply want the model up to date.

## Common Pitfalls

- **`undefined` on missing rows.** Don't assume the result is non-null; the row might have been deleted.
- **Not the same as `find` on the same id**: `Fresh` runs against the same query *without scopes*, preserving things like soft-delete trash visibility from the original instance.
- **`Refresh` is async** — always await it; failing to await leaves the instance in a stale state and the promise unhandled.

## See Also

- [`refresh`](./fresh) — in-place reload.
- [`save`](./save) / [`update`](./update) — write changes.
- [`with`](./with) — eager-load on a query.
- [`getAttribute`](./getAttribute) — read a single attribute.
