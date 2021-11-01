## has on nested self referencing belongs to many relationship

```typescript
const user   = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
const friend = await user.newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
await friend.newRelation('friends').create({
      'email': 'foo@gmail.com'
    });
const results = await FedacoTestUser.createQuery().has('friends.friends').get();
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
