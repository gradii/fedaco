# Function InitAttributes
### basic model hydration

```typescript
let user = FedacoTestUser.initAttributes({
  email: 'linbolen@gradii.com'
});
user.setConnection('second_connection');
await user.save();
user = FedacoTestUser.initAttributes({
  email: 'xsilen@gradii.com'
});
user.setConnection('second_connection');
await user.save();
const models = await FedacoTestUser.useConnection(
  'second_connection'
).fromQuery('SELECT * FROM users WHERE email = ?', ['xsilen@gradii.com']);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `models[0]` | instance type exactly match | `FedacoTestUser` |
> | `models[0].email` | exactly match | `'xsilen@gradii.com'` |
> | `models[0].getConnectionName()` | exactly match | `'second_connection'` |
> | `models.length` | exactly match | `1` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

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

### save or fail with duplicated entry

```typescript
const date = '1970-01-01';
await FedacoTestPost.createQuery().create({
  id: 1,
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date
});
const post = FedacoTestPost.initAttributes({
  id: 1,
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date
});
await expect(async () => {
  await post.saveOrFail();
}).rejects.toThrowError('SQLSTATE[23000]:');
```


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)

### save or fail

```typescript
const date = '1970-01-01';
const post = FedacoTestPost.initAttributes({
  user_id: 1,
  name: 'Post',
  created_at: date,
  updated_at: date
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `await FedacoTestPost.createQuery().count()` | match | `1` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
