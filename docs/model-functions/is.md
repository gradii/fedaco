# `is`

Compare two model instances for **logical equality** — same primary key, same table, same connection. Different from JavaScript's `===`, which compares object identity.

## Signature

```ts
model.Is(other: Model | null): boolean
model.IsNot(other: Model | null): boolean
```

## Real-World Use Cases

### 1. Two retrievals of the same row

```ts
const saved = await User.createQuery().create({
  id: 1,
  email: 'ada@example.com',
});

const retrieved = await User.createQuery().find(1);

saved.Is(retrieved); // true — same id, table, connection
saved === retrieved; // false — different JS objects
```

### 2. Compare against a possibly-null value

```ts
const current = await User.createQuery().find(currentUserId);
const owner = await Post.createQuery().find(postId).then((p) => p?.author);

if (current.Is(owner)) {
  // current user owns this post
}
```

`Is(null)` returns `false` rather than throwing.

### 3. Negation — `IsNot`

```ts
if (post.author.IsNot(currentUser)) {
  throw new ForbiddenError();
}
```

Reads better than `!post.author.Is(currentUser)`.

## What "Equal" Means

`Is` returns true only when **all three** match:

1. `GetKey()` — same primary-key value.
2. `GetTable()` — same table.
3. `GetConnectionName()` — same connection.

The third check is important in multi-connection setups: a `User` loaded on `default` and a `User` loaded on `replica` with the same id are **not** considered equal — they may legitimately be two different rows in two different physical databases.

## Common Pitfalls

- **Don't use `===` for model equality.** Two models loaded by separate calls are different JS objects but represent the same row.
- **Don't compare across model types.** `Is` doesn't check that `other` is the same class — only the table. Two unrelated subclasses pointing at the same table would compare as equal.
- **Connection-sensitive.** If you fetch the same row on two connections, `Is` returns `false`. That's deliberate but can surprise you when you switch connections at runtime.

## See Also

- [`getKey`](./getAttribute) — the primary-key value used in the comparison.
- [`getConnectionName`](./getConnectionName) — same-connection check.
