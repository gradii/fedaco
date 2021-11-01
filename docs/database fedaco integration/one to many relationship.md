## one to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
await (user.newRelation('posts') as HasMany).create({
      'name': 'First Post'
    });
await user.newRelation('posts').create({
      'name': 'Second Post'
    });
const posts = await user.posts;
const post2 = await user.newRelation('posts').where('name', 'Second Post').first();
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
