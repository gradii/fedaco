# Function update
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


> | Reference | Looks Like | Value                                                                                                                                                                                                                               |
> | ------ | ----- |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
> | `freshStoredUser1.toArray()` | match | ({ </br>'id'        : 1, </br>'name'      : 'Mathieu TUDISCO', </br>'email'     : 'dev@mathieutu.ovh', </br>'birthday'  : nowWithFractionsSerialized, </br>'created_at': nowSerialized, </br>'updated_at': nowSerialized</br>    }); |
> | `storedUser1` | instance type exactly match | `FedacoTestUser`                                                                                                                                                                                                                    |
> | `storedUser2.toArray()` | match | ({</br>'id'        : 2,</br>'email'     : 'linbolen@gradii.com', </br>'birthday'  : nowWithFractionsSerialized, </br>'created_at': nowSerialized,</br> 'updated_at': nowSerialized </br>});`                                        |
> | `freshStoredUser2.toArray()` | match | ({</br>'id'        : 2, </br>'name'      : null, </br>'email'     : 'dev@mathieutu.ovh', </br>'birthday'  : nowWithFractionsSerialized, </br>'created_at': nowSerialized, </br>'updated_at': nowSerialized</br>    });              |
> | `storedUser2` | instance type exactly match | `FedacoTestUser`                                                                                                                                                                                                                    |
> | `notStoredUser.toArray()` | match | ({</br> 'id'      : 3,</br> 'email'   : 'linbolen@gradii.com',</br> 'birthday': nowWithFractionsSerialized</br>    }); |
> | `freshNotStoredUser` | exactly match | `null` |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")

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
> | `model.json` | match | ({</br> 'x': 0,</br> 'y': '1'</br>    }); |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `'json->a->b' in model.toArray()` | exactly match false | `();` |
> | `model.json` | match | ({</br> 'x': 0,</br> 'y': '1',</br> 'a': {</br> 'b': '3'</br> }</br>    }); |


----
see also [prerequisites]("./../database fedaco integration/prerequisite.md")
