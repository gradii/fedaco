# `whereHas`

Filter parent rows by the existence of related rows that match a callback. Compiles to `WHERE EXISTS (SELECT ...)` against the related table — no join, no eager-load.

## Signature

```ts
FedacoBuilder<T>.whereHas(
  relation: string,
  callback?: (q: FedacoBuilder<R>) => void,
  operator?: string,
  count?: number,
): this
```

## Parameters

| Name        | Description |
| ----------- | ----------- |
| `relation`  | Name of the relation method on the model. |
| `callback`  | Constraints applied to the related query. Pass nothing for "any related row exists". |
| `operator`  | Comparison operator on the count: `>`, `>=`, `<`, `<=`, `=`, `!=`. Default `>=`. |
| `count`     | Threshold for the count comparison. Default `1`. |

## Real-World Use Cases

### 1. Parents with at least one matching child

```ts
const usersWithPublishedPosts = await User.createQuery()
  .whereHas('posts', (q) => {
    q.where('published', true);
  })
  .get();
```

Compiles to roughly:

```sql
SELECT * FROM users WHERE EXISTS (
  SELECT * FROM posts WHERE posts.user_id = users.id AND published = ?
)
```

### 2. Existence without constraints

```ts
const writers = await User.createQuery().whereHas('posts').get();
```

Equivalent to [`has('posts')`](./has) — `whereHas` with no callback degenerates to plain existence.

### 3. Count comparisons

```ts
// Users who wrote 5+ posts
const prolific = await User.createQuery()
  .whereHas('posts', (q) => q.where('published', true), '>=', 5)
  .get();
```

### 4. Nested whereHas across two levels

```ts
const users = await User.createQuery()
  .whereHas('posts', (q) => {
    q.whereHas('comments', (cq) => {
      cq.where('flagged', true);
    });
  })
  .get();
```

Each level fires its own `EXISTS` subquery.

### 5. Excluding parents — `whereDoesntHave`

The negation:

```ts
const usersWithoutPosts = await User.createQuery()
  .whereDoesntHave('posts')
  .get();
```

### 6. Combined with eager loading

```ts
const users = await User.createQuery()
  .whereHas('posts', (q) => q.where('published', true))
  .with('posts')        // eager-load *all* posts (including drafts)
  .get();
```

The constraint in `whereHas` filters parents; it doesn't restrict which posts get loaded by `with`. To load only published posts, constrain inside `with`:

```ts
.with('posts', (q) => q.where('published', true))
```

## `whereHas` vs `has` vs `with`

| Tool             | Effect on parents | Effect on relation rows |
| ---------------- | ----------------- | ----------------------- |
| [`with`](./with)         | none — all parents returned     | loads them onto each parent |
| [`has`](./has)           | filters parents to those with related rows | none — no rows hydrated |
| [`whereHas`](./whereHas) | filters with custom constraints | none |
| `with` + `whereHas`      | filters parents *and* loads relation | both — independent constraint sets |

## Common Pitfalls

- **Constraints inside `whereHas` don't affect what `with` loads.** They're separate concerns — keep both if you need both.
- **`whereHas` runs subqueries; large datasets may benefit from a join + group instead.** For polymorphic or deep nesting, profile before assuming `whereHas` is fastest.
- **Dotted relation names (`'posts.comments'`)** — supported, each segment becomes its own `EXISTS`.

## See Also

- [`has`](./has) — existence-only variant (no callback).
- [`with`](./with) — eager-load relation rows.
- [`getRelation`](./getRelation) — load one relation lazily on a single instance.
- Relationships docs ([Defining Relationships](../relationships/defining-relationships/relation-one-to-one)).
