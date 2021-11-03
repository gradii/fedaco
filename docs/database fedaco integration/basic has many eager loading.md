## basic has many eager loading

```typescript
let user: FedacoTestUser = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await user.newRelation('posts').create({
  name: 'First Post'
});
user = await FedacoTestUser.createQuery()
  .with('posts')
  .where('email', 'linbolen@gradii.com')
  .first();
```
```typescript
const post = await FedacoTestPost.createQuery()
  .with('user')
  .where('name', 'First Post')
  .get();
```


----
see also [prerequisites](./prerequisite.md)
