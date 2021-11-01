## find or fail

```typescript
await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
const single   = await FedacoTestUser.createQuery().findOrFail(1);
const multiple = await FedacoTestUser.createQuery().findOrFail([1, 2]);
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
