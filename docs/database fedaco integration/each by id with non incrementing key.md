## each by id with non incrementing key

```typescript
await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' First'
    });
await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' Second'
    });
await FedacoTestNonIncrementingSecond.createQuery().create({
      'name': ' Third'
    });
const users = [];
await FedacoTestNonIncrementingSecond.createQuery()
      .eachById(2, 'name')
      .pipe(
        tap(({item: user, index: i}) => {
          users.push([user.name, i]);
        })
      ).toPromise();
```