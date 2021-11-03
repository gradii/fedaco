## has on nested self referencing belongs to many relationship with where pivot

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
const friend = await user.newRelation('friends').create({
  id: 2,
  email: 'xsilen@gradii.com'
});
await friend.newRelation('friends').create({
  id: 3,
  email: 'foo@gmail.com'
});
const results = await FedacoTestUser.createQuery()
  .has('friendsOne.friendsTwo')
  .get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./prerequisite.md)
