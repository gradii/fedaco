# Function Fillable
### saving json fields

```typescript
const model = await FedacoTestWithJSON.createQuery().create({
  json: {
    x: 0
  }
});
```
```typescript
model.fillable(['json->y', 'json->a->b']);
await model.update({
  'json->y': '1'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.json` | match | `({
      'x': 0,
      'y': '1'
    });` |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `'json->a->b' in model.toArray()` | exactly match | `false` |
> | `model.json` | match | `({
      'x': 0,
      'y': '1',
      'a': {
        'b': '3'
      }
    });` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
