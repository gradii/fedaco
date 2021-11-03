## where has on self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
const results: FedacoTestUser[] = await FedacoTestUser.createQuery()
  .whereHas('friends', (query) => {
    query.where('email', 'xsilen@gradii.com');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./prerequisite.md)
