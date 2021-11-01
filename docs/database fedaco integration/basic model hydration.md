## basic model hydration

```typescript
let user = FedacoTestUser.initAttributes({
      'email': 'linbolen@gradii.com'
    });
user.setConnection('second_connection');
await user.save();
user = FedacoTestUser.initAttributes({
      'email': 'xsilen@gradii.com'
    });
user.setConnection('second_connection');
await user.save();
const models = await FedacoTestUser.useConnection('second_connection').fromQuery(
      'SELECT * FROM users WHERE email = ?', ['xsilen@gradii.com']);
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
