## morph map is used when fetching parent

```typescript
Relation.morphMap({
  user: FedacoTestUser,
  post: FedacoTestPost
});
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('photos').create({
  name: 'Avatar 1'
});
const photo = await FedacoTestPhoto.createQuery().first();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await photo.imageable` | type exactly match | `FedacoTestUser` |


----
see also [prerequisites](./prerequisite.md)
