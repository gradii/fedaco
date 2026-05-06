# `head`

::: warning
`head` is a [@gradii/nanofn](https://github.com/gradii/nanofn) array helper, **not** a fedaco function. It appears in test fixtures because the e2e suite uses it for asserting against the first element of a result array.
:::

## What it does

```ts
import { head } from '@gradii/nanofn';

head([1, 2, 3]); // 1
head([]);        // undefined
```

It's a typed alias for `arr[0]`, equivalent to lodash's `head` / `_.first`.

## Why it shows up in fedaco docs

Several test snippets read like:

```ts
expect(head(friends).email).toBe('xsilen@gradii.com');
expect(head(friends).getRelation('pivot').getAttribute('user_id')).toBe(user.id);
```

That's just `expect(friends[0].email).toBe(...)` — using `head` reads slightly nicer when the variable is a generic `Array<T>` and you don't want index notation.

## Real-World Use Cases (in your own code)

You typically don't need `head` for fedaco — the builder already has a [`first`](./first) method that runs at the SQL level. Use `head` only when you've already materialised an array and want the first element:

```ts
import { head } from '@gradii/nanofn';

const users = await User.createQuery().limit(5).get();
const top = head(users); // User | undefined
```

For the builder-level "first matching row" pattern, prefer `first()` — it adds `LIMIT 1` to the SQL and saves you a round trip:

```ts
const top = await User.createQuery().first();
```

## See Also

- [@gradii/nanofn docs](https://github.com/gradii/nanofn)
- [`first`](./first) — query-level "first" with `LIMIT 1`.
- [`pluck`](./pluck) — fetch a single column's values.
