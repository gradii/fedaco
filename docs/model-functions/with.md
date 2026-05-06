# `with`

Eager-load related models alongside the query. Avoids the N+1 query problem — instead of one SELECT per parent + one per relation per row, fedaco issues one SELECT for the parents and one batched SELECT per declared relation.

## Signature

```ts
FedacoBuilder<T>.with(relation: string): this
FedacoBuilder<T>.with(relation: string, callback: (q) => void): this
FedacoBuilder<T>.with(...relations: string[]): this
FedacoBuilder<T>.with(relations: { [name: string]: (q) => void }): this
```

## Parameters

| Name        | Description |
| ----------- | ----------- |
| `relation`  | Name of a method on the model that returns a `Relation` (`HasOne`, `HasMany`, `BelongsTo`, `BelongsToMany`, polymorphic, …). |
| `callback`  | Function that receives the relation's query builder — apply scopes, additional `where`, `select`, ordering. |

Pass dotted names like `'posts.comments'` to eager-load nested relations.

## Real-World Use Cases

### 1. Single relation

```ts
const users = await User.createQuery().with('posts').get();

for (const u of users) {
  console.log(u.name, u.posts.length); // posts already loaded
}
```

A second `SELECT * FROM posts WHERE user_id IN (?, ?, ?, ...)` runs once for the whole set.

### 2. Multiple relations

```ts
const users = await User.createQuery().with('posts', 'profile', 'team').get();
```

Or as an array:

```ts
await User.createQuery().with(['posts', 'profile']).get();
```

### 3. Constrain a relation while loading

```ts
const users = await User.createQuery()
  .with('posts', (q) => {
    q.where('published', true).orderBy('created_at', 'desc').limit(5);
  })
  .get();

// users[i].posts contains only the latest 5 published posts per user.
```

### 4. Nested eager loading

```ts
const users = await User.createQuery()
  .with('posts.comments.author')
  .get();
```

Each level fires one batched query — three extra round trips total, regardless of row count.

### 5. Mixed simple + constrained

```ts
const users = await User.createQuery()
  .with({
    profile: () => {},                       // unconstrained
    posts: (q) => q.where('draft', false),   // constrained
  })
  .get();
```

### 6. Eager-load only specific columns

Use the `relation:col1,col2` shorthand inside a string:

```ts
await User.createQuery().with('posts:id,user_id,title').get();
```

The foreign key (`user_id`) is required so the relation can match — fedaco won't add it for you.

### 7. Prevent eager loading

```ts
await Post.createQuery().without('author').get();
```

Drops a `with` set earlier in the chain or by a global scope.

### 8. Replace the eager-load list

```ts
await User.createQuery().withOnly('posts').get();
```

Resets `_eagerLoad` and adds only `posts`.

## Common Pitfalls

- **Names match the method, not the foreign key.** If your model defines `posts(): HasMany`, use `with('posts')`, not `with('user_posts')`.
- **Ordering inside `with`** orders the *relation* rows, not the parents. Use the outer `.orderBy(...)` for parent ordering.
- **Selecting columns** must include the foreign key, otherwise the matcher can't pair children to parents.

## See Also

- [`whereHas`](./whereHas) — *filter* parents by a relation, in addition to or instead of loading.
- [`has`](./has) — filter parents that have at least one related row.
- [`getRelation`](./getRelation) — fetch a relation lazily on a single instance.
- Relationships docs ([Defining Relationships](../relationships/defining-relationships/relation-one-to-one)).
