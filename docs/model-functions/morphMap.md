# `morphMap`

Polymorphic-relation type alias registry. Map short type names (`'user'`, `'post'`) to model classes so the `*_type` column on a polymorphic table stores the alias instead of a fully-qualified class name.

## Signature

```ts
class Relation {
  static morphMap(map?: Record<string, typeof Model>, merge?: boolean): Record<string, typeof Model>;
}
```

## Parameters

| Name    | Required | Description |
| ------- | -------- | ----------- |
| `map`   | optional | Object of alias → model class. Pass nothing to read the current map. |
| `merge` | default `true` | When `true`, merges with the existing map. Pass `false` to replace. |

Returns the resolved map (after the call).

## Real-World Use Cases

### 1. Register aliases at app startup (default merge)

```ts
import { Relation } from '@gradii/fedaco';
import { User } from './models/user';
import { Post } from './models/post';

const map1 = { user: User };
const map2 = { post: Post };

Relation.morphMap(map1);
Relation.morphMap(map2);
// Both 'user' and 'post' are now registered (default behaviour merges).
```

### 2. Replace the map (no merge)

```ts
Relation.morphMap({ user: User }, /* merge */ false);
Relation.morphMap({ post: Post }, /* merge */ false);
// After the second call, only 'post' is in the map.
```

### 3. Use with morph relations

Once registered, `morphMany` / `morphTo` columns store the alias:

```ts
Relation.morphMap({
  user: User,
  post: Post,
});

const user = await User.createQuery().create({ email: 'linbolen@gradii.com' });
await user.NewRelation('photos').create({ name: 'Avatar 1' });
await user.NewRelation('photos').create({ name: 'Avatar 2' });

const post = await user.NewRelation('posts').create({ name: 'First Post' });
await post.NewRelation('photos').create({ name: 'Hero 1' });
await post.NewRelation('photos').create({ name: 'Hero 2' });

(await user.photos)[0].GetAttribute('imageable_type'); // 'user'
(await post.photos)[0].GetAttribute('imageable_type'); // 'post'
```

The `imageable_type` column stores the alias (`'user'` / `'post'`) — not the class name. `morphTo` resolves back to the right class via the same map:

```ts
const photo = await Photo.createQuery().first();
const owner = await photo.imageable; // FedacoTestUser
```

### 4. Read current map

```ts
const m = Relation.morphMap();
console.log(m); // { user: User, post: Post }
```

## Why Use a Morph Map?

- **Refactor-safe**: rename your `Post` class without breaking historical rows.
- **Database-friendly**: short, stable type names are easier to query and index.
- **Cross-language**: another service reading the same database can rely on stable type tokens, regardless of whether your code is TS, PHP, or anything else.

## Common Pitfalls

- **Register before any morph queries run.** If a polymorphic query fires before `morphMap` is called, fedaco will store/expect the bare class name. Mixing the two yields rows that no longer resolve.
- **Aliases must be unique.** A second call with the same alias overwrites the previous mapping; downstream rows pointing at the older mapping silently break.
- **All polymorphic models should be in the map.** Don't half-register — either map every model or none, otherwise queries will mix aliases and class names.

## See Also

- [Polymorphic Relationships](../relationships/polymorphic-relationships/polymorphic-introduction).
- [Custom Polymorphic Types](../relationships/polymorphic-relationships/custom-polymorphic-types).
