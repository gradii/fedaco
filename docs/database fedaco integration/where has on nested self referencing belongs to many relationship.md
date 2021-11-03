## where has on nested self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  email: 'xsilen@gradii.com'
});
await friend.newRelation('friends').create({
  email: 'foo@gmail.com'
});
const results: FedacoTestUser[] = await FedacoTestUser.createQuery()
  .whereHas('friends.friends', (query) => {
    query.where('email', 'foo@gmail.com');
  })
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./prerequisite.md)
