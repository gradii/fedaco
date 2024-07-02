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
model.Fillable(['json->y', 'json->a->b']);
await model.update({
  'json->y': '1'
});
```


> | Reference | Looks Like | Value                                   |
> | ------ | ----- |-----------------------------------------|
> | `model.json` | match | ({ <br/> 'x': 0, <br/>'y': '1' <br/>}); |


> | Reference | Looks Like | Value                                                                                                              |
> | ------ | ----- |--------------------------------------------------------------------------------------------------------------------|
> | `'json->a->b' in model.toArray()` | exactly match | `false`                                                                                                            |
> | `model.json` | match | ({ <br/> &nbsp; 'x': 0, <br /> &nbsp; 'y': '1', <br /> &nbsp; 'a': { <br /> &nbsp; &nbsp; 'b': '3' <br/> } <br/>    });` |


----
see also [prerequisites](./../database-fedaco-integration/prerequisite)
