## has on self referencing belongs to many relationship

```typescript
const user = await FedacoTestUser.createQuery().create({
      'email': 'linbolen@gradii.com'
    });
await user.newRelation('friends').create({
      'email': 'xsilen@gradii.com'
    });
```
```typescript
const results = await FedacoTestUser.createQuery().has('friends').get();
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
