# Function StartOfSecond
### fresh method on model

```typescript
const now = new Date();
const nowSerialized = formatISO(startOfSecond(now));
const nowWithFractionsSerialized = now.toJSON();
// Carbon.setTestNow(now);
const storedUser1 = await FedacoTestUser.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com',
  birthday: now
});
await storedUser1.NewQuery().update({
  email: 'dev@mathieutu.ovh',
  name: 'Mathieu TUDISCO'
});
const freshStoredUser1 = await storedUser1.Fresh();
const storedUser2 = await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'linbolen@gradii.com',
  birthday: now
});
await storedUser2.NewQuery().update({
  email: 'dev@mathieutu.ovh'
});
const freshStoredUser2 = await storedUser2.Fresh();
const notStoredUser = FedacoTestUser.initAttributes({
  id: 3,
  email: 'linbolen@gradii.com',
  birthday: now
});
const freshNotStoredUser = await notStoredUser.Fresh();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `freshStoredUser1.toArray()` | match | `({
      'id'        : 1,
      'name'      : 'Mathieu TUDISCO',
      'email'     : 'dev@mathieutu.ovh',
      'birthday'  : nowWithFractionsSerialized,
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });` |
> | `storedUser1` | instance type exactly match | `FedacoTestUser` |
> | `storedUser2.toArray()` | match | `({
      'id'        : 2,
      'email'     : 'linbolen@gradii.com',
      'birthday'  : nowWithFractionsSerialized,
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });` |
> | `freshStoredUser2.toArray()` | match | `({
      'id'        : 2,
      'name'      : null,
      'email'     : 'dev@mathieutu.ovh',
      'birthday'  : nowWithFractionsSerialized,
      'created_at': nowSerialized,
      'updated_at': nowSerialized
    });` |
> | `storedUser2` | instance type exactly match | `FedacoTestUser` |
> | `notStoredUser.toArray()` | match | `({
      'id'      : 3,
      'email'   : 'linbolen@gradii.com',
      'birthday': nowWithFractionsSerialized
    });` |
> | `freshNotStoredUser` | exactly match | `null` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
