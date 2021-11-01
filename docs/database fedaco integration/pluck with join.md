## pluck with join

```typescript
const user1 = await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
const user2 = await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
await (user2.newRelation('posts') as HasMany).create({
      'id'  : 1,
      'name': 'First post'
    });
await (user1.newRelation('posts') as HasMany).create({
      'id'  : 2,
      'name': 'Second post'
    });
const query = FedacoTestUser.createQuery().join('posts', 'users.id', '=', 'posts.user_id');
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
