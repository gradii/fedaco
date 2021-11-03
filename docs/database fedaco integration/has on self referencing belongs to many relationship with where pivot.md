## has on self referencing belongs to many relationship with where pivot

```typescript
const user = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await user.newRelation('friends').create({
  id: 2,
  email: 'xsilen@gradii.com'
});
const results = await FedacoTestUser.createQuery().has('friendsOne').get();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(results).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./prerequisite.md)
