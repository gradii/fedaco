## pluck

```typescript
await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
const simple = await FedacoTestUser.createQuery()
      .oldest('id')
      .pluck('users.email');
const keyed  = await FedacoTestUser.createQuery()
      .oldest('id')
      .pluck('users.email', 'users.id');
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
