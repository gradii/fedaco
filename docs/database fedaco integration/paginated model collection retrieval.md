## paginated model collection retrieval

```typescript
await new FedacoTestUser().newQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await new FedacoTestUser().newQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await new FedacoTestUser().newQuery().create({
  id: 3,
  email: 'foo@gmail.com'
});
// Paginator.currentPageResolver(() => {
//   return 1;
// });
let models = await new FedacoTestUser().newQuery().oldest('id').paginate(1, 2);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `models.items[0]` | type exactly match | `FedacoTestUser` |
> | `models.items[1]` | type exactly match | `FedacoTestUser` |
> | `models.items[0].email` | exactly match | `'linbolen@gradii.com'` |
> | `models.items[1].email` | exactly match | `'xsilen@gradii.com'` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `models.items.length` | exactly match | `1` |
> | `models.items[0]` | type exactly match | `FedacoTestUser` |
> | `models.items[0].email` | exactly match | `'foo@gmail.com'` |


----
see also [prerequisites](./prerequisite.md)
