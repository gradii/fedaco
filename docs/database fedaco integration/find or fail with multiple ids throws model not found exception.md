## find or fail with multiple ids throws model not found exception

```typescript
await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
await expect(async () => {
      await FedacoTestUser.createQuery().findOrFail([1, 2]);
    }).rejects.toThrowError(
      'ModelNotFoundException No query results for model [FedacoTestUser] [1,2]');
```