## fresh method on model

```typescript
const now                        = new Date();
const nowSerialized              = formatISO(startOfSecond(now));
const nowWithFractionsSerialized = now.toJSON();
// Carbon.setTestNow(now);
    const storedUser1                = await FedacoTestUser.createQuery().create({
      'id'      : 1,
      'email'   : 'linbolen@gradii.com',
      'birthday': now
    });
await storedUser1.newQuery().update({
      'email': 'dev@mathieutu.ovh',
      'name' : 'Mathieu TUDISCO'
    });
const freshStoredUser1 = await storedUser1.fresh();
const storedUser2      = await FedacoTestUser.createQuery().create({
      'id'      : 2,
      'email'   : 'linbolen@gradii.com',
      'birthday': now
    });
await storedUser2.newQuery().update({
      'email': 'dev@mathieutu.ovh'
    });
const freshStoredUser2   = await storedUser2.fresh();
const notStoredUser      = FedacoTestUser.initAttributes({
      'id'      : 3,
      'email'   : 'linbolen@gradii.com',
      'birthday': now
    });
const freshNotStoredUser = await notStoredUser.fresh();
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
