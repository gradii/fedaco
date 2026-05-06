# `saveOrFail`

Save the model **inside a transaction**. If the save fails or any event handler aborts, the transaction rolls back and the failure surfaces as a thrown error.

## Signature

```ts
model.SaveOrFail(options?: { touch?: boolean }): Promise<boolean>
```

## Returns

- `true` on successful save.
- Otherwise throws — the promise rejects with the original error and the transaction is rolled back.

## Real-World Use Cases

### 1. Force a transaction for a single save

```ts
const user = User.initAttributes({ email: 'ada@example.com' });

try {
  await user.SaveOrFail();
} catch (e) {
  console.error('save failed, transaction rolled back:', e);
}
```

`SaveOrFail` opens its own transaction via the model's connection, calls `save()`, and commits if everything succeeded. Any error inside `save()` (DB constraint, event handler returning `false` translated to an error, …) bubbles up.

### 2. As part of a larger transaction

When you're already inside a `db().transaction(...)`, the model's `save()` already participates in that outer transaction — `SaveOrFail` doesn't add value. Use it for *single-write* operations that need atomicity, not as a wrapper inside `transaction()`.

### 3. Pair with custom event handlers

If an `updating` handler decides the write should fail, throwing from the handler causes `SaveOrFail` to throw too:

```ts
class User extends Model {
  Boot() {
    this.registerModelEvent('updating', (model) => {
      if (model.isLocked) throw new Error('user is locked');
    });
  }
}

try {
  await user.SaveOrFail();
} catch (e) {
  // user.isLocked threw; nothing was persisted.
}
```

## `Save` vs `SaveOrFail`

| Method        | Wraps in transaction? | On failure |
| ------------- | --------------------- | ---------- |
| `save`        | no                    | returns `false` (event abort) or throws (DB error) |
| `SaveOrFail`  | yes — model's connection | always throws on failure; rolls back |

## Common Pitfalls

- **Don't nest unnecessarily.** Inside an existing `db().transaction(tx => ...)`, plain `save()` is enough.
- **Connection comes from the model.** If your instance has `_connection = 'replica'`, the implicit transaction is on `replica`, not the default.

## See Also

- [`save`](./save) — non-throwing save.
- [Transactions Guide](../database/transactions) — when to wrap multiple operations.
