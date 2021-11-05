# Function Fresh
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
await storedUser1.newQuery().update({
  email: 'dev@mathieutu.ovh',
  name: 'Mathieu TUDISCO'
});
const freshStoredUser1 = await storedUser1.fresh();
const storedUser2 = await FedacoTestUser.createQuery().create({
  id: 2,
  email: 'linbolen@gradii.com',
  birthday: now
});
await storedUser2.newQuery().update({
  email: 'dev@mathieutu.ovh'
});
const freshStoredUser2 = await storedUser2.fresh();
const notStoredUser = FedacoTestUser.initAttributes({
  id: 3,
  email: 'linbolen@gradii.com',
  birthday: now
});
const freshNotStoredUser = await notStoredUser.fresh();
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
> | `storedUser1` | type exactly match | `FedacoTestUser` |
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
> | `storedUser2` | type exactly match | `FedacoTestUser` |
> | `notStoredUser.toArray()` | match | `({
      'id'      : 3,
      'email'   : 'linbolen@gradii.com',
      'birthday': nowWithFractionsSerialized
    });` |
> | `freshNotStoredUser` | exactly match | `null` |


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)

### model ignored by global scope can be refreshed

```typescript
const user = await FedacoTestUserWithOmittingGlobalScope.createQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
```


----
see also [prerequisites](./../database fedaco integration/prerequisite.md)
