# `doesntExist`

Negative existence check — returns `true` when no row matches the query, `false` when at least one does. The mirror of `exists`.

## Signature

```ts
FedacoBuilder<T>.doesntExist(): Promise<boolean>
FedacoBuilder<T>.exists(): Promise<boolean>
```

Both compile to `SELECT EXISTS(SELECT 1 FROM ... WHERE ...)`-style SQL — they short-circuit at the first match, so they're cheaper than `count() > 0`.

## Real-World Use Cases

### 1. "Is this email available?"

```ts
const available = await User.createQuery()
  .where('email', email)
  .doesntExist();

if (!available) {
  throw new Error('email already taken');
}
```

### 2. Guarded delete

```ts
if (await Post.createQuery().where('user_id', userId).where('pinned', true).doesntExist()) {
  await user.Delete();
}
```

### 3. Negation of `exists`

These two snippets do the same thing:

```ts
if (await User.createQuery().where('email', email).exists()) { ... }
if (!(await User.createQuery().where('email', email).doesntExist())) { ... }
```

`exists` reads slightly better when the success branch is the "found" case; `doesntExist` reads better when the success branch is the "missing" case.

## `doesntExist` vs `count` vs `find`

| Tool                     | Returns      | When to use |
| ------------------------ | ------------ | ----------- |
| `doesntExist` / `exists` | boolean      | Short-circuit — you only care if any match. |
| [`count`](./count)       | number       | You need the actual quantity. |
| [`find`](./find)         | model or none | You also want the row's data. |

For "is there any?" prefer `exists`/`doesntExist` — faster and clearer.

## See Also

- `exists` (positive variant)
- [`count`](./count) — when you need the number.
- [`first`](./first) — when you also want the row.
- [`where`](./where) — building the criteria.
