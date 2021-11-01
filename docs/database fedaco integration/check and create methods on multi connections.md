## check and create methods on multi connections

```typescript
await FedacoTestUser.createQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
await FedacoTestUser.useConnection('second_connection')
      .find(
        FedacoTestUser.useConnection('second_connection').insert({
          'id'   : 2,
          'email': 'tony.stark@gradii.com'
        })
      );
let user1 = await FedacoTestUser.useConnection('second_connection').findOrNew(1);
let user2 = await FedacoTestUser.useConnection('second_connection').findOrNew(2);
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
```typescript
user2 = await FedacoTestUser.useConnection('second_connection').firstOrNew({
      'email': 'tony.stark@gradii.com'
    });
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
```typescript
user2 = await FedacoTestUser.useConnection('second_connection').firstOrCreate({
      'email': 'tony.stark@gradii.com'
    });
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
