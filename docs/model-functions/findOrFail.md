# `findOrFail`

Like [`find`](./find), but throws `ModelNotFoundException` when no row matches. Pass an array of ids to require **all** of them to exist.

## Signature

```ts
FedacoBuilder<T>.findOrFail(id: string | number, columns?: string[]): Promise<T>
FedacoBuilder<T>.findOrFail(ids: any[], columns?: string[]): Promise<T[]>
```

## Parameters

| Name      | Required | Description |
| --------- | -------- | ----------- |
| `id`      | ✓        | Primary-key value, or array of values. |
| `columns` | optional | Columns to select. Defaults to `['*']`. |

## Returns

The model (or array of models). Throws if any requested id is missing.

## Behaviour Difference From `find`

| Input        | `find` | `findOrFail` |
| ------------ | ------ | ------------ |
| Scalar, found       | model        | model |
| Scalar, missing     | `undefined`  | throws `ModelNotFoundException` |
| Array, all found    | array        | array |
| Array, partial      | partial array | throws `ModelNotFoundException` |
| Array, none found   | `[]`         | throws `ModelNotFoundException` |

## Real-World Use Cases

### 1. HTTP 404 mapping

`findOrFail` lets you skip the `if (!user) throw 404` boilerplate:

```ts
import { ModelNotFoundException } from '@gradii/fedaco';

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.createQuery().findOrFail(req.params.id);
    res.json(user);
  } catch (e) {
    if (e instanceof ModelNotFoundException) {
      res.status(404).end();
      return;
    }
    throw e;
  }
});
```

Wrap the `try/catch` in a global error handler so your route handlers stay clean.

### 2. Required relation traversal

```ts
const post = await Post.createQuery().findOrFail(postId);
const author = await User.createQuery().findOrFail(post.author_id);
```

If either record is missing, the request fails fast instead of silently dereferencing `undefined`.

### 3. Inside a transaction (atomic delete)

```ts
await db().transaction(async (tx) => {
  const user = await User.createQuery(tx).findOrFail(userId);
  await user.Delete();
});
```

The transaction rolls back if the user wasn't found, leaving prior writes untouched.

### 4. Bulk: require *all* ids

```ts
// All four IDs must exist; otherwise throws.
const team = await User.createQuery().findOrFail([1, 2, 3, 4]);
console.log(team.length); // 4 (or throws)
```

This is the right call when partial success would be a bug — e.g. assigning a permission set where every user must exist.

### 5. Project columns

```ts
const user = await User.createQuery().findOrFail(42, ['id', 'email']);
```

## Common Pitfalls

- **The error is a thrown `Error`, not a Promise rejection callback** — make sure your async handler awaits the call so the rejection surfaces.
- **Bulk semantics differ from `find`**: `find([1, 99])` quietly returns `[user1]`; `findOrFail([1, 99])` throws. Pick the one that matches your intent.
- **Don't catch and ignore.** If you don't actually want the failure, use `find` or `findOrNew`.

## See Also

- [`find`](./find) — non-throwing version.
- [`findOrNew`](./findOrNew) — return a fresh, unsaved instance when missing.
- [`firstOrFail`](./first) — same idea, but for `where`-built queries.
- [`firstOrCreate`](./firstOrCreate) — find or insert.
