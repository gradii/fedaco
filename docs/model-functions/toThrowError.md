# `toThrowError`

::: warning
`toThrowError` is a [Jest matcher](https://jestjs.io/docs/expect#tothrowerror), **not** a fedaco method. It appears in test fixtures because the e2e tests use it to assert that fedaco APIs throw the right errors.
:::

## What it does

Asserts that a function (or `await`ed expression) throws an error matching a string, regex, or `Error` subclass:

```ts
await expect(async () => {
  await User.createQuery().findOrFail(99);
}).rejects.toThrowError('ModelNotFoundException No query results for model [User] 99');
```

## Why it shows up in fedaco docs

Because the auto-generated docs include snippets from fedaco's own assertion suite:

```ts
// findOrFail with multiple ids
await expect(async () => {
  await User.createQuery().findOrFail([1, 2]);
}).rejects.toThrowError(
  'ModelNotFoundException No query results for model [FedacoTestUser] [1,2]',
);

// findOrFail with single id
await expect(async () => {
  await User.createQuery().findOrFail(1);
}).rejects.toThrowError(
  'ModelNotFoundException No query results for model [FedacoTestUser] 1',
);

// has on a polymorphic relation that hasn't been declared
await expect(async () => {
  await User.createQuery().has('imageable').get();
}).rejects.toThrowError(
  `the relation [imageable] can't acquired. try to define a relation like\n@HasManyColumn()\npublic readonly imageable;\n`,
);

// saveOrFail with duplicated entry
const date = '1970-01-01';
await Post.createQuery().create({ id: 1, user_id: 1, name: 'Post', created_at: date, updated_at: date });
const dup = Post.initAttributes({ id: 1, user_id: 1, name: 'Post', created_at: date, updated_at: date });
await expect(async () => {
  await dup.saveOrFail();
}).rejects.toThrowError('SQLSTATE[23000]:');
```

## Useful Patterns When Testing Fedaco

### 1. Assert specific error class

```ts
import { ModelNotFoundException } from '@gradii/fedaco';

await expect(builder.findOrFail(missingId))
  .rejects
  .toThrowError(ModelNotFoundException);
```

### 2. Assert mass-assignment failures

```ts
expect(() => user.Fill({ admin: true }))
  .toThrowError(/MassAssignmentException/);
```

### 3. Assert validation errors from custom event handlers

```ts
class Post extends Model {
  Boot() {
    this.registerModelEvent('saving', (post) => {
      if (post.title.length === 0) throw new Error('title required');
    });
  }
}

await expect(post.save()).rejects.toThrowError('title required');
```

## See Also

- [Jest matcher reference](https://jestjs.io/docs/expect#tothrowerror)
- [`findOrFail`](./findOrFail) / [`firstOrFail`](./first) — fedaco APIs that throw.
- [`saveOrFail`](./saveOrFail) — transactional save that throws on failure.
