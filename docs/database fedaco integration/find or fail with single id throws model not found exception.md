## find or fail with single id throws model not found exception

```typescript
await expect(async () => {
  await FedacoTestUser.createQuery().findOrFail(1);
}).rejects.toThrowError(
  'ModelNotFoundException No query results for model [FedacoTestUser] 1'
);
```


----
see also [prerequisites](./prerequisite.md)
