# `startOfSecond`

::: warning
`startOfSecond` is a [date-fns](https://date-fns.org/v2.30.0/docs/startOfSecond) helper, **not** a fedaco function. It appears in fedaco test fixtures because the e2e tests pin timestamps via `formatISO(startOfSecond(now))`.
:::

## What it does

Discards the millisecond component of a `Date`, returning a new `Date` aligned to the second:

```ts
import { startOfSecond } from 'date-fns';

const t = new Date('2026-05-07T10:23:19.734Z');
startOfSecond(t); // 2026-05-07T10:23:19.000Z
```

## Why it shows up in fedaco docs

Several model assertions compare a serialised `Date` against `formatISO(startOfSecond(now))` rather than `now.toISOString()`, because:

1. SQLite truncates fractional seconds depending on the column type.
2. `startOfSecond(now)` discards milliseconds before formatting, so the assertion is stable across drivers.

```ts
const now = new Date();
const expected = formatISO(startOfSecond(now));

const post = await Post.createQuery().create({ published_at: now });
expect(formatISO(post.published_at)).toBe(expected);
```

## Real-World Use Cases (in your own code)

You typically don't need this in production — fedaco serialises model dates via the connection grammar. Reach for `startOfSecond` only when comparing values that came back from a column with second-precision storage:

```ts
import { startOfSecond } from 'date-fns';

expect(startOfSecond(post.published_at).getTime()).toBe(startOfSecond(now).getTime());
```

## See Also

- [date-fns `startOfSecond` docs](https://date-fns.org/v2.30.0/docs/startOfSecond)
- [`formatISO`](./formatISO) — also from date-fns.
- [`setDateFormat`](./setDateFormat) — control fedaco's serialisation precision instead of trimming after the fact.
