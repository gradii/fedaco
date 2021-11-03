## basic model retrieval

```typescript
const factory = new FedacoTestUser();
await factory.newQuery().create({
  id: 1,
  email: 'linbolen@gradii.com'
});
await factory.newQuery().create({
  id: 2,
  email: 'xsilen@gradii.com'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `      await factory.newQuery().where('email', 'linbolen@gradii.com').doesntExist()` | exactly match false | `();` |
> | `      await factory.newQuery().where('email', 'mohamed@laravel.com').doesntExist()` | exactly match | `true` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.email` | exactly match | `'linbolen@gradii.com'` |
> | `model.email !== undefined` | exactly match | `true` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `friends !== undefined` | exactly match | `true` |
> | `friends` | match | `[]` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model` | type exactly match | `FedacoTestUser` |
> | `model.id` | match | `1` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model` | type exactly match | `FedacoTestUser` |
> | `model.id` | match | `2` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `missing` | exactly match | `Undefined();` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(collection)` | exactly match | `true` |
> | `collection.length` | exactly match | `0` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `isArray(collection)` | exactly match | `true` |
> | `collection.length` | exactly match | `2` |
```typescript
// .cursor();
for (const m of models) {
  expect(m.id).toEqual(1);
  expect(m.getConnectionName()).toBe('default');
}
```


----
see also [prerequisites](./prerequisite.md)
