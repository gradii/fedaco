# `getRelation`

Look up a relation on a model — either the **definition** (a `Relation` instance) or the **loaded data**, depending on which `getRelation` you call.

This page covers two APIs that share the name:

| Where | Returns | Triggers a query? |
| ----- | ------- | ----------------- |
| `model.GetRelation('name')` | The loaded relation data (set by `with` / `load`) | ✗ |
| `builder.getRelation('name')` | A `Relation` definition instance, ready to query | ✗ until you call something on it |

## On a Model — Loaded Data

```ts
model.GetRelation(name: string): any
```

Returns whatever was stored in `_relations[name]` (typically an array of children for `HasMany` / `BelongsToMany`, or a single model for `HasOne` / `BelongsTo`). Returns `undefined` if the relation hasn't been loaded.

### 1. Read after eager-load

```ts
const user = await User.createQuery().with('posts').find(1);
const posts = user.GetRelation('posts'); // Post[]
```

Same as `user.posts` — direct property access goes through the same `_relations` dictionary.

### 2. Pivot data on a many-to-many relation

The canonical e2e pattern — pivot rows are materialised under the `pivot` key on each related model:

```ts
const user = await User.createQuery().create({ email: 'linbolen@gradii.com' });
const friend = await user.NewRelation('friends').create({
  email: 'xsilen@gradii.com',
});

const u1: User = await User.createQuery().first();

await u1
  .NewRelation('friends')
  .chunk(2)
  .pipe(
    tap(({ results: friends }) => {
      const f = friends[0];
      console.log(f.email); // 'xsilen@gradii.com'
      console.log(f.GetRelation('pivot').GetAttribute('user_id'));   // user.id
      console.log(f.GetRelation('pivot').GetAttribute('friend_id')); // friend.id
    }),
  )
  .toPromise();
```

For `BelongsToMany`, each related model carries a `pivot` relation containing the join-row attributes.

## On a Builder — Relation Definition

```ts
builder.getRelation(name: string): Relation
```

Internal — used by `with()` to build the eager-load query. You rarely call this directly. It's exposed because custom scopes / plugins occasionally need to introspect a relation's foreign keys.

```ts
const relation = User.createQuery().getRelation('posts');
console.log(relation.getForeignKeyName());
console.log(relation.getQualifiedParentKeyName());
```

## Real-World Use Cases

### 1. Check whether a relation was loaded

```ts
function isLoaded(model: Model, relation: string): boolean {
  return model.GetRelation(relation) !== undefined;
}
```

Useful for conditional eager-loading or to avoid lazy-loading regressions.

### 2. Walk loaded relations

```ts
const user = await User.createQuery().with('posts.comments').find(1);
for (const post of user.GetRelation('posts')) {
  for (const comment of post.GetRelation('comments')) {
    console.log(comment.body);
  }
}
```

## Common Pitfalls

- **Doesn't lazy-load.** If the relation wasn't loaded via `with` / `load`, you get `undefined`. To fetch a single relation on the fly, use [`newRelation`](./newRelation).
- **Don't confuse the two APIs.** `model.GetRelation` returns data; `builder.getRelation` returns a `Relation` instance.
- **The `pivot` relation only exists on many-to-many results.** For `HasMany` / `BelongsTo`, accessing `getRelation('pivot')` returns `undefined`.

## See Also

- [`with`](./with) — eager-load relations.
- [`newRelation`](./newRelation) — lazy-fetch a relation on a single instance.
- [Defining Relationships](../relationships/defining-relationships/relation-one-to-one).
