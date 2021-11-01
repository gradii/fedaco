## basic model collection retrieval

```typescript
await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
await FedacoTestUser.createQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
const models = await new FedacoTestUser().newQuery().oldest('id').get();
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
