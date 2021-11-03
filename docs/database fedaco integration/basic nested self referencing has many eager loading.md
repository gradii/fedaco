## basic nested self referencing has many eager loading

```typescript
let user: FedacoTestUser = await FedacoTestUser.createQuery().create({
  email: 'linbolen@gradii.com'
});
const post: FedacoTestPost = await user.newRelation('posts').create({
  name: 'First Post'
});
await post.newRelation('childPosts').create({
  name: 'Child Post',
  user_id: user.id
});
user = await FedacoTestUser.createQuery()
  .with('posts.childPosts')
  .where('email', 'linbolen@gradii.com')
  .first();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `head(await user.posts).name` | exactly match | `'First Post'` |
> | `head(await head(await user.posts).childPosts)` | exactly not match | `Null();` |
> | `head(await head(await user.posts).childPosts as any[]).name` | exactly match | `'Child Post'` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `(await head(posts).parentPost)` | exactly not match | `Null();` |
> | `(await head(posts).parentPost).user` | exactly not match | `Null();` |
> | `(await head(posts).parentPost).user.email` | exactly match | `'linbolen@gradii.com'` |


----
see also [prerequisites](./prerequisite.md)
