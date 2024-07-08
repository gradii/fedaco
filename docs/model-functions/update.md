# Function Update
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
> | `freshStoredUser1.toArray()` | match | ({ <br/>&nbsp;&nbsp;'id'        : 1,<br/>&nbsp;&nbsp; 'name'      : 'Mathieu TUDISCO',<br/>&nbsp;&nbsp; 'email'     : 'dev@mathieutu.ovh',<br/>&nbsp;&nbsp; 'birthday'  : nowWithFractionsSerialized,<br/>&nbsp;&nbsp; 'created_at': nowSerialized,<br/>&nbsp;&nbsp; 'updated_at': nowSerialized<br/>}); |
> | `storedUser1` | instance type exactly match | `FedacoTestUser` |
> | `storedUser2.toArray()` | match | ({<br/>&nbsp;&nbsp;'id'        : 2,<br/>&nbsp;&nbsp;'email'     : 'linbolen@gradii.com',<br/>&nbsp;&nbsp; 'birthday'  : nowWithFractionsSerialized,<br/>&nbsp;&nbsp; 'created_at': nowSerialized,<br/>&nbsp;&nbsp; 'updated_at': nowSerialized<br/>    });` |
> | `freshStoredUser2.toArray()` | match | ({<br/>&nbsp;&nbsp; 'id'        : 2,<br/>&nbsp;&nbsp; 'name'      : null,<br/>&nbsp;&nbsp; 'email'     : 'dev@mathieutu.ovh',<br/>&nbsp;&nbsp; 'birthday'  : nowWithFractionsSerialized,<br/>&nbsp;&nbsp; 'created_at': nowSerialized, <br/>&nbsp;&nbsp;'updated_at': nowSerialized<br/>    }); |
> | `storedUser2` | instance type exactly match | `FedacoTestUser` |
> | `notStoredUser.toArray()` | match | ({<br/>&nbsp;&nbsp; 'id'      : 3, 'email'   : 'linbolen@gradii.com',<br/>&nbsp;&nbsp; 'birthday': nowWithFractionsSerialized<br/>}); |
> | `freshNotStoredUser` | exactly match | `null` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### saving json fields

```typescript
const model = await FedacoTestWithJSON.createQuery().create({
  json: {
    x: 0
  }
});
```
```typescript
model.fillable(['json->y', 'json->a->b']);
await model.update({
  'json->y': '1'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.json` | match | ({<br/>&nbsp;&nbsp; 'x': 0,<br/>&nbsp;&nbsp; 'y': '1'<br/>    }); |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `'json->a->b' in model.toArray()` | exactly match | `false` |
> | `model.json` | match | ({<br/>&nbsp;&nbsp; 'x': 0,<br/>&nbsp;&nbsp; 'y': '1',<br/>&nbsp;&nbsp; 'a': {<br/>&nbsp;&nbsp; 'b': '3'<br/>&nbsp;&nbsp; }<br/>    }); |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
