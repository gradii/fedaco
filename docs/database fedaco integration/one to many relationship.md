## one to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
await (user.newRelation('posts') as HasMany).create({
  name: 'First Post'
});
await user.newRelation('posts').create({
  name: 'Second Post'
});
const posts = await user.posts;
const post2 = await user
  .newRelation('posts')
  .where('name', 'Second Post')
  .first();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `posts.length` | exactly match | `2` |
> | `posts[0]` | type exactly match | `FedacoTestPost` |
> | `posts[1]` | type exactly match | `FedacoTestPost` |
> | `post2` | type exactly match | `FedacoTestPost` |
> | `post2.name` | exactly match | `'Second Post'` |
> | `await post2.user` | type exactly match | `FedacoTestUser` |
> | `(await post2.user).email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./prerequisite.md)
