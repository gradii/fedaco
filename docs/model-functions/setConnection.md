# Function SetConnection
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
