# `has`

Filter parent rows that have at least one related row. Identical mechanism to [`whereHas`](./whereHas) — compiles to `WHERE EXISTS (...)` — but doesn't take a callback for the related-row constraints.

## Signature

```ts
FedacoBuilder<T>.has(
  relation: string,
  operator?: string,
  count?: number,
): this
```

## Parameters

| Name        | Description |
| ----------- | ----------- |
| `relation`  | Relation method name. Supports dotted paths like `'posts.comments'`. |
| `operator`  | `>`, `>=`, `<`, `<=`, `=`, `!=`. Default `>=`. |
| `count`     | Compared against the related-row count. Default `1`. |

## Real-World Use Cases

### 1. Parents that have any related row

```ts
const writers = await User.createQuery().has('posts').get();
```

Returns users with at least one post.

### 2. Negation — `doesntHave`

```ts
const empty = await User.createQuery().doesntHave('posts').get();
```

### 3. Count thresholds

```ts
// Users with 5+ posts
const prolific = await User.createQuery().has('posts', '>=', 5).get();

// Users with exactly 0 likes
const lonely = await User.createQuery().has('likes', '=', 0).get();
```

### 4. Nested paths

```ts
const users = await User.createQuery().has('posts.comments').get();
// users → who have at least one post → which has at least one comment
```

Each segment becomes a separate `EXISTS` subquery.

### 5. With eager loading and ordering

```ts
const tagged = await Post.createQuery()
  .has('tags')
  .with('tags')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();
```

## `has` vs `whereHas`

Use `has` when you don't need to add WHERE clauses against the related table. It's faster to type and reads more clearly. Switch to `whereHas` whenever you need to filter related rows:

```ts
// has — any related post
.has('posts')

// whereHas — only related posts that are published
.whereHas('posts', (q) => q.where('published', true))
```

## Common Pitfalls

- **`has` can't apply WHERE on the relation.** If you need that, use `whereHas`.
- **Dotted relations**: each segment must be a real relation method on the corresponding model.
- **Compares row count, not column values.** For "has at least one post with views > 1000", you need `whereHas` with a count comparison.

## See Also

- [`whereHas`](./whereHas) — has with related-row constraints.
- [`with`](./with) — eager load instead of (or in addition to) filter.
- [`getRelation`](./getRelation) — fetch a relation on one instance.
