## paginated model collection retrieval

```typescript
await new FedacoTestUser().newQuery().create({
      'id'   : 1,
      'email': 'linbolen@gradii.com'
    });
await new FedacoTestUser().newQuery().create({
      'id'   : 2,
      'email': 'xsilen@gradii.com'
    });
await new FedacoTestUser().newQuery().create({
      'id'   : 3,
      'email': 'foo@gmail.com'
    });
// Paginator.currentPageResolver(() => {
    //   return 1;
    // });
    let models = await new FedacoTestUser().newQuery()
      .oldest('id').paginate(1, 2);
```

> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
