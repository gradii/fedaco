# `newRelation`

Build a relation query rooted at this model instance — used as the entry point for `attach` / `sync` / loading children for a single parent.

## Signature

```ts
model.NewRelation(name: string): Relation
```

## Parameters

| Name   | Description |
| ------ | ----------- |
| `name` | The name of a method on the model that returns a `Relation` (`HasOne`, `HasMany`, `BelongsTo`, `BelongsToMany`, polymorphic). |

## Returns

A `Relation` instance pre-bound to this parent. Calling `get()`, `attach()`, `create()`, etc. on it scopes by the relation's foreign keys.

## Real-World Use Cases

### 1. Load related rows for one parent

```ts
const user = await User.createQuery().find(1);
const posts = await user.NewRelation('posts').get();
```

For multiple parents, use [`with`](./with) instead — `with` batches the relation query.

### 2. Create through a relation

```ts
const post = await user.NewRelation('posts').create({
  title: 'Hello',
  body: 'Content',
});
// post.user_id === user.id, set automatically.
```

### 3. Many-to-many: attach / sync / detach

```ts
await post.NewRelation('tags').attach([1, 2, 3]);
await post.NewRelation('tags').sync([2, 4]);
await post.NewRelation('tags').detach(1);
```

See [`attach`](./attach) for full pivot-write semantics.

### 4. Filter children of one parent

```ts
const recentPosts = await user.NewRelation('posts')
  .where('created_at', '>', oneWeekAgo)
  .orderBy('created_at', 'desc')
  .limit(5)
  .get();
```

### 5. Count without loading

```ts
const postCount = await user.NewRelation('posts').count();
```

## How It Differs From `with` / `getRelation`

| Tool                 | When to use |
| -------------------- | ----------- |
| `model.NewRelation('x')` | Build a relation query for one parent, then run it manually. |
| `query.with('x')`        | Eager-load relations for many parents at once. |
| `model.GetRelation('x')` | Synchronously get the relation *definition* (used inside scopes / custom queries). |
| `model._relations.x` | Read the loaded relation cache after `with` / `load` populated it. |

## Common Pitfalls

- **Relation must be defined on the model.** A `NewRelation('foo')` call where `foo()` doesn't exist throws `RelationNotFoundException`.
- **Foreign key is set automatically on `create` / `attach`.** Don't pass it yourself — fedaco overrides it from the parent anyway.
- **For batched loads, use `with`.** Calling `NewRelation('posts').get()` for each user in a list is the N+1 problem.

## See Also

- [`attach`](./attach) — many-to-many pivot inserts.
- [`with`](./with) — eager-load relations.
- [`getRelation`](./getRelation) — get the relation definition.
- [Defining Relationships](../relationships/defining-relationships/relation-one-to-one).
