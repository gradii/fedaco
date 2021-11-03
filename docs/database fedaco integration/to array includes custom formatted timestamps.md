## to array includes custom formatted timestamps

```typescript
const model = new FedacoTestUserWithCustomDateSerialization();
model.setRawAttributes({
  created_at: '2012-12-04',
  updated_at: '2012-12-05'
});
const array = model.toArray();
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `array['updated_at']` | exactly match | `'05-12-12'` |


----
see also [prerequisites](./prerequisite.md)
