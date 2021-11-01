## basic nested self referencing has many eager loading

```typescript
// @ts-ignore
    let user: FedacoTestUser   = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
// @ts-ignore
    const post: FedacoTestPost = await user.newRelation('posts').create({
      'name': 'First Post'
    });
await post.newRelation('childPosts').create({
      'name'   : 'Child Post',
      'user_id': user.id
    });
user = await FedacoTestUser.createQuery().with('posts.childPosts').where('email',
      'linbolen@gradii.com').first();
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
