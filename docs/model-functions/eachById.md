# `eachById`

Iterate matching rows one at a time using **keyset pagination**. Wraps [`chunkById`](./chunkById) — fetches in pages internally, hands you one row per emission.

This is the safer counterpart to [`each`](./each) — stable when other writers are inserting/deleting rows in the table you're scanning.

## Signature

```ts
FedacoBuilder<T>.eachById(
  count: number,
  column?: string,
): Observable<{ item: T; index: number }>
```

::: tip
Unlike `each`, the builder returns an RxJS `Observable`. Use `.pipe(...)` or `.toPromise()` to consume it.
:::

## Parameters

| Name      | Default          | Description |
| --------- | ---------------- | ----------- |
| `count`   | —                | Page size (rows fetched per round trip). |
| `column`  | model's primary key | Column to paginate by. Must be unique and monotonic. |

## Real-World Use Cases

### 1. Per-row processing with safe paging

```ts
import { tap } from 'rxjs';

const processed: string[] = [];

await User.createQuery()
  .where('active', true)
  .eachById(500)
  .pipe(
    tap(({ item: user }) => {
      processed.push(user.email);
    }),
  )
  .toPromise();
```

Each chunk is `WHERE id > <last_id> ORDER BY id LIMIT 500`. Concurrent INSERTs into the table don't shift offsets — you keep moving forward without skipping or revisiting.

### 2. Custom column for non-incrementing keys

```ts
await NonIncrementingModel.createQuery()
  .eachById(2, 'name')
  .pipe(
    tap(({ item: user, index: i }) => {
      console.log(`#${i}: ${user.name}`);
    }),
  )
  .toPromise();
```

When the model uses a non-incrementing key (a slug, UUIDv7), pass a unique sortable column.

### 3. Stop early via `take`

```ts
import { take, tap } from 'rxjs';

await User.createQuery()
  .eachById(100)
  .pipe(
    take(1000),
    tap(({ item }) => audit(item)),
  )
  .toPromise();
```

### 4. Async per-row work with back-pressure

```ts
import { concatMap, from } from 'rxjs';

await User.createQuery()
  .eachById(200)
  .pipe(
    concatMap(({ item }) => from(syncToCrm(item))),
  )
  .toPromise();
```

`concatMap` waits for each `syncToCrm` to finish before pulling the next row.

## `eachById` vs `each` vs `chunkById`

| Method                  | Pagination strategy   | Per-row API |
| ----------------------- | --------------------- | ----------- |
| [`each`](./each)        | LIMIT / OFFSET        | callback |
| [`eachById`](./eachById) | `WHERE id > X`       | observable |
| [`chunkById`](./chunkById) | `WHERE id > X`     | callback (per chunk) |

## Common Pitfalls

- **Column must be unique and monotonic.** Ties at a chunk boundary may be skipped.
- **Don't forget `toPromise()`** (or subscribe). A bare `.pipe(...)` chain is lazy.
- **For large RxJS chains**, prefer named operators (`tap`, `concatMap`, `take`).

## See Also

- [`each`](./each) — OFFSET-based variant.
- [`chunkById`](./chunkById) — keyset chunks (page array).
- [`forPageAfterId`](./forPageAfterId) — single keyset page.
