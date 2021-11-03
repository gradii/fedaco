## basic model collection retrieval

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
const models = await new FedacoTestUser().newQuery().oldest('id').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(models)` | exactly match | `true` |
> | `models[0]` | type exactly match | `FedacoTestUser` |
> | `models[1]` | type exactly match | `FedacoTestUser` |
> | `models[0].email` | exactly match | `'linbolen@gradii.com'` |
> | `models[1].email` | exactly match | `'xsilen@gradii.com'` |


----
see also [prerequisites](./prerequisite.md)
