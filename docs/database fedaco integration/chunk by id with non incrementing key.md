## chunk by id with non incrementing key

```typescript
await FedacoTestNonIncrementingSecond.createQuery().create({
  name: ' First'
});
await FedacoTestNonIncrementingSecond.createQuery().create({
  name: ' Second'
});
await FedacoTestNonIncrementingSecond.createQuery().create({
  name: ' Third'
});
let i = 0;
const spy = jest.fn(({ results: users, page }) => {
  if (!i) {
    expect(users[0].name).toBe(' First');
    expect(users[1].name).toBe(' Second');
  } else {
    expect(users[0].name).toBe(' Third');
  }
  i++;
});
await FedacoTestNonIncrementingSecond.createQuery()
  .chunkById(2, 'name')
  .pipe(
    finalize(() => {
      expect(i).toEqual(2);
    }),
    tap(spy)
  )
  .toPromise();
```


----
see also [prerequisites](./prerequisite.md)
