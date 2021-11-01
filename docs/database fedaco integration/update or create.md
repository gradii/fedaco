## update or create

```typescript
const user1 = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
const user2 = await FedacoTestUser.createQuery().updateOrCreate({
      'email': 'linbolen@gradii.com'
    }, {
      'name': 'Taylor Otwell'
    });
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
