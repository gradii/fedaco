## find or fail

```typescript
await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
const single = await FedacoTestUser.createQuery().findOrFail(1);
const multiple = await FedacoTestUser.createQuery().findOrFail([1, 2]);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `single.email` | exactly match | `'linbolen@gradii.com'` |
> | `isArray(multiple)` | exactly match | `true` |
> | `multiple[0]` | type exactly match | `FedacoTestUser` |
> | `multiple[1]` | type exactly match | `FedacoTestUser` |


----
see also [prerequisites](./prerequisite.md)
