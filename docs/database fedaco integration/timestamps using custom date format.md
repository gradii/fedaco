## timestamps using custom date format

```typescript
const model = new FedacoTestUser();
model.setDateFormat('yyyy-MM-dd HH:mm:ss.SSSS');
model.setRawAttributes({
  created_at: '2017-11-14 08:23:19.0000',
  updated_at: '2017-11-14 08:23:19.7348'
});
```


> | Reference | Looks Like | Value |
> | ------ | ----- | ----- |
> | `model.fromDateTime(model.getAttribute('updated_at'))` | exactly match | `'2017-11-14 08:23:19.734800'` |


----
see also [prerequisites](./prerequisite.md)
