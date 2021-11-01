## saving json fields

```typescript
const model = await FedacoTestWithJSON.createQuery().create({
      'json': {
        'x': 0
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
> | xxx | ----- | yyy |


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | xxx | ----- | yyy |
> | xxx | ----- | yyy |
