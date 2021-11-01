## pluck with column name containing a space

```typescript
await FedacoTestUserWithSpaceInColumnName.createQuery().create({
      'id'           : 1,
      'email_address': 'linbolen@gradii.com'
    });
await FedacoTestUserWithSpaceInColumnName.createQuery().create({
      'id'           : 2,
      'email_address': 'xsilen@gradii.com'
    });
const simple = await FedacoTestUserWithSpaceInColumnName.createQuery().oldest('id').pluck(
      'users_with_space_in_colum_name.email_address');
const keyed  = await FedacoTestUserWithSpaceInColumnName.createQuery().oldest('id').pluck(
      'email_address',
      'id');
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
