# Predefined `onQuery` on Relation Annotations

Every relation-column decorator (`@HasOneColumn`, `@HasManyColumn`, `@BelongsToColumn`, `@BelongsToManyColumn`, the morph variants, …) accepts an **`onQuery`** callback. Fedaco invokes it with the freshly-built `Relation` instance — your callback can add `where` clauses, joins, scopes, pivot columns, "one of many" disambiguators, or any other builder mutation that should be **baked into the relation definition itself**.

Use it when:

- The relation should always carry a constraint (e.g. "active friends only").
- The relation should always pull in pivot columns or use a custom pivot model.
- The relation needs a query-time scope that can't be expressed in the decorator's built-in fields.
- You want a `HasOne` that selects "the most recent" / "the highest priced" via `latestOfMany` / `oldestOfMany`.

Constraints applied through `onQuery` run **on every read** of the relation — eager-load (`with`), lazy `NewRelation('x').get()`, `whereHas`, …

## API

```ts
interface RelationColumnAnnotation<T extends Relation = Relation> {
  // ...other fields per decorator...
  onQuery?: (q: T | Relation | any) => void;
}
```

The argument is the relation instance itself — for `BelongsToManyColumn` it's a `BelongsToMany`, for `HasOneColumn` it's a `HasOne`, etc. Inside the callback you can call any builder method or any relation-specific helper.

::: tip
You can reach the underlying `FedacoBuilder` via `q.getQuery()` if a method you need lives on the builder rather than the relation. See the `HasOne + join` example below.
:::

## Examples by Relation Type

### `@HasOneColumn` — eager-join an extra table

```ts
import {
  Column, ForwardRef, HasOneColumn, Model, PrimaryColumn, Table,
  type FedacoBuilder, type FedacoRelationType, type JoinClauseBuilder,
} from '@gradii/fedaco';

@Table({ tableName: 'users' })
export class User extends Model {
  @PrimaryColumn() declare id: number;

  @HasOneColumn({
    related: forwardRef(() => Post),
    foreignKey: 'user_id',
    onQuery: (q: FedacoBuilder) => {
      q.join('photo', (join: JoinClauseBuilder) => {
        join.on('photo.imageable_id', 'post.id');
        join.where('photo.imageable_type', 'Post');
      });
    },
  })
  public postWithPhotos: FedacoRelationType<Post>;
}
```

The relation always joins `photo` so callers can write `User.createQuery().has('postWithPhotos')` without re-stating the join.

### `@HasManyColumn` — fixed `where` constraint

```ts
@Table({ tableName: 'users' })
class User extends Model {
  @HasManyColumn({
    related: forwardRef(() => Post),
    foreignKey: 'user_id',
    onQuery: (q) => {
      q.where('published', true);
    },
  })
  public publishedPosts: FedacoRelationListType<Post>;
}
```

`user.NewRelation('publishedPosts').get()` and `User.createQuery().with('publishedPosts').get()` both apply the `published = true` clause.

### `@HasOneOfManyColumn` — pick the latest / oldest

The dedicated "one of many" decorator pairs naturally with `latestOfMany` / `oldestOfMany` inside `onQuery`:

```ts
import { HasOneOfManyColumn } from '@gradii/fedaco';

@Table({ tableName: 'users' })
class User extends Model {
  @HasOneOfManyColumn({
    related: forwardRef(() => Price),
    foreignKey: 'user_id',
    onQuery: (q) => {
      q.latestOfMany(['published_at', 'id']);
    },
  })
  public price_with_shortcut: FedacoRelationType<Price>;
}
```

This compiles to a window-function subquery that picks one row per parent. Pass an array when you need a tie-breaker — `published_at` first, falling back to `id`.

Variants:

```ts
onQuery: (q) => q.latestOfMany('created_at')   // most recent
onQuery: (q) => q.oldestOfMany('created_at')   // first
onQuery: (q) => q.ofMany('total', 'max')       // largest
onQuery: (q) => q.ofMany('total', 'min')       // smallest
```

### `@HasOneThroughColumn` — constrain the intermediate

```ts
@Table({ tableName: 'mechanics' })
class Mechanic extends Model {
  @HasOneThroughColumn({
    related: forwardRef(() => CarOwner),
    through: forwardRef(() => Car),
    firstKey: 'mechanic_id',
    secondKey: 'car_id',
    onQuery: (q) => {
      q.where('cars.active', true);
    },
  })
  public activeOwner: FedacoRelationType<CarOwner>;
}
```

Filter by a column on the intermediate (`cars`) table without writing the join yourself.

### `@HasManyThroughColumn` — scope the through

Same shape as `@HasOneThroughColumn`, returning many. Useful for "all comments on a user's posts where the comment is not soft-deleted":

```ts
@HasManyThroughColumn({
  related: forwardRef(() => Comment),
  through: forwardRef(() => Post),
  firstKey: 'user_id',
  secondKey: 'post_id',
  onQuery: (q) => {
    q.whereNull('comments.deleted_at')
     .where('posts.published', true);
  },
})
public liveCommentsOnPublishedPosts: FedacoRelationListType<Comment>;
```

### `@BelongsToColumn` — filter the parent side

```ts
@BelongsToColumn({
  related: forwardRef(() => User),
  foreignKey: 'foo_id',
  onQuery: (r: Relation) => {
    r.where('active', true);
  },
})
public activeFoo: FedacoRelationType<User>;
```

Only resolves the related row when it's `active`.

### `@BelongsToManyColumn` — filter, pivot, and using a custom pivot model

#### a) Filter via `wherePivot`

```ts
@BelongsToManyColumn({
  related: User,
  table: 'friends',
  foreignPivotKey: 'user_id',
  relatedPivotKey: 'friend_id',
  onQuery: (q: BelongsToMany) => {
    q.wherePivot('user_id', 1);
  },
})
friendsOne: FedacoRelationListType<User>;

@BelongsToManyColumn({
  related: User,
  table: 'friends',
  foreignPivotKey: 'user_id',
  relatedPivotKey: 'friend_id',
  onQuery: (q: BelongsToMany) => {
    q.wherePivot('user_id', 2);
  },
})
friendsTwo: FedacoRelationListType<User>;
```

Two variants of the same many-to-many table, each scoped to a different pivot value.

#### b) Custom pivot model + extra columns

```ts
@BelongsToManyColumn({
  related: User,
  table: 'friends',
  foreignPivotKey: 'user_id',
  relatedPivotKey: 'friend_id',
  onQuery: (q: BelongsToMany) => {
    q.using(FedacoTestFriendPivot)
     .withPivot('user_id', 'friend_id', 'friend_level_id');
  },
})
friends: FedacoRelationListType<User>;
```

Now `user.friends[i].pivot` is a `FedacoTestFriendPivot` instance, and the pivot exposes `friend_level_id` alongside the standard keys.

#### c) Using + extra pivot field on a many-to-many

```ts
@BelongsToManyColumn({
  related: Role,
  table: 'role_user',
  foreignPivotKey: 'user_id',
  relatedPivotKey: 'role_id',
  onQuery: (q: any) => {
    q.using(RoleUserPivot);
    q.withPivot('extra_field');
  },
})
roles: FedacoRelationListType<Role>;
```

### `@BelongsToManyColumn` — include soft-deleted rows

```ts
import { withTrashed } from '@gradii/fedaco';

@HasManyColumn({
  related: forwardRef(() => SoftDeletesPost),
  foreignKey: 'user_id',
  onQuery: (q) => {
    q.pipe(withTrashed());
  },
})
public posts: FedacoRelationListType<SoftDeletesPost>;
```

`pipe(withTrashed())` removes the soft-delete scope inside the relation, so trashed children are included whenever you read it.

### `@MorphOneColumn` — single morphed child

```ts
@Table({ tableName: 'posts' })
class Post extends Model {
  @MorphOneColumn({
    related: forwardRef(() => Photo),
    morphTypeMap: { name: 'imageable_type', id: 'imageable_id' },
    onQuery: (q) => {
      q.where('primary', true);
    },
  })
  public primaryPhoto: FedacoRelationType<Photo>;
}
```

### `@MorphManyColumn` — collection of morphed children

```ts
@MorphManyColumn({
  related: forwardRef(() => Comment),
  morphTypeMap: { name: 'commentable_type', id: 'commentable_id' },
  onQuery: (q) => {
    q.where('approved', true).orderBy('created_at', 'desc');
  },
})
public approvedComments: FedacoRelationListType<Comment>;
```

### `@MorphToColumn` — child → polymorphic parent

```ts
@MorphToColumn({
  morphTypeMap: { name: 'commentable_type', id: 'commentable_id' },
  onQuery: (q) => {
    // Useful when every commentable should always carry a base scope.
    q.where('archived', false);
  },
})
public commentable: any;
```

### `@MorphToManyColumn` — many-to-many with a polymorphic side

```ts
@MorphToManyColumn({
  related: forwardRef(() => Tag),
  name: 'taggable',
  onQuery: (q) => {
    q.wherePivot('weight', '>', 0).orderBy('tags.name');
  },
})
public tags: FedacoRelationListType<Tag>;
```

### `@MorphedByManyColumn` — the other side of a morph-to-many

```ts
@MorphedByManyColumn({
  related: forwardRef(() => Post),
  name: 'taggable',
  onQuery: (q) => {
    q.where('posts.published', true);
  },
})
public posts: FedacoRelationListType<Post>;
```

### `@MorphEagerToColumn` — eager-loadable polymorphic parent

```ts
@MorphEagerToColumn({
  name: 'imageable',
  onQuery: (q) => {
    q.with('subscriptions');
  },
})
public imageable: any;
```

`onQuery` lets you bake further eager-loads onto the polymorphic parent without the caller knowing the concrete type.

## When `onQuery` Fires

Fedaco calls your callback once per relation **build**, after the standard scope (foreign-key WHERE, morph-type WHERE for polymorphic relations, etc.) is applied. That means:

- **Eager loads (`with('rel')`)** — `onQuery` runs as part of building the eager-load query.
- **Lazy access (`model.NewRelation('rel').get()`)** — runs when the relation is built.
- **Existence checks (`whereHas('rel', ...)`)** — runs when the subquery is built; your callback's clauses end up inside the `EXISTS (...)`.

It does **not** run for raw `db().query().from('table')` calls — `onQuery` is a relation-level hook, not a global query scope. For global behaviour, write a [global scope](../query-relationships) instead.

## Combining `onQuery` With Caller-Side Constraints

Caller-side `with(name, callback)` constraints stack on top of `onQuery`:

```ts
class User extends Model {
  @HasManyColumn({
    related: forwardRef(() => Post),
    foreignKey: 'user_id',
    onQuery: (q) => q.where('published', true),
  })
  public publishedPosts: FedacoRelationListType<Post>;
}

// onQuery + caller's where merge — only the user's published posts that are
// also pinned.
const users = await User.createQuery()
  .with('publishedPosts', (q) => q.where('pinned', true))
  .get();
```

The compiled SQL has **both** `published = true` (from `onQuery`) and `pinned = true` (from the `with` callback).

## Common Pitfalls

- **Don't override the foreign key.** The decorator already applies the foreign-key WHERE before calling `onQuery`. Adding a conflicting `where('user_id', ...)` produces wrong results.
- **`onQuery` runs every read.** It's not a one-time setup hook — make it side-effect-free and fast.
- **`pipe(withTrashed())` only works on soft-delete models.** It removes a scope that doesn't exist on non-soft-delete models — silently no-ops there.
- **For `BelongsToMany`, type the parameter as `BelongsToMany`** so `wherePivot` / `using` / `withPivot` autocomplete. Otherwise TypeScript treats `q` as the generic builder and only base methods show up.
- **`@MorphToColumn` doesn't take `foreignKey`** in the decorator (the field is omitted from the type). Polymorphic constraints go through `onQuery` instead.

## See Also

- [Eager Loading](../eager-loading) — caller-side constraints via `with(name, callback)`.
- [Query Relationships](../query-relationships) — `whereHas`, `has`, scope composition.
- [Defining One-to-One](./relation-one-to-one), [One-to-Many](./relation-one-to-many), [One of Many](./relation-has-one-of-many) — base shapes onto which `onQuery` layers.
- [Many to Many](../many-to-many-relationship/relation-many-to-many) — pivot tables and `wherePivot`.
- [Polymorphic Relationships](../polymorphic-relationships/polymorphic-introduction) — morph relations.
